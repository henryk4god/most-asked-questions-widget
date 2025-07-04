// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const fetchBtn = document.getElementById('maqFetchBtn');
    const nicheInput = document.getElementById('maqNicheInput');
    const resultsContainer = document.getElementById('maqResults');
    const loader = document.getElementById('maqLoader');
    const errorContainer = document.getElementById('maqError');
    const copyAllContainer = document.querySelector('.maq-copy-all-container');
    const copyAllBtn = document.getElementById('maqCopyAllBtn');
    
    // Backend API endpoint
    const BACKEND_API_URL = 'https://most-asked-question-api.onrender.com/api/most-asked-questions';
    
    // Add click handler to fetch button
    fetchBtn.addEventListener('click', async function() {
        // Reset UI state
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '<div class="maq-copy-all-container"><button id="maqCopyAllBtn" class="maq-copy-all-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy All Results</button></div>';
        errorContainer.style.display = 'none';
        
        // Get niche value
        const niche = nicheInput.value.trim();
        
        // Show loading state
        fetchBtn.disabled = true;
        fetchBtn.classList.add('loading');
        loader.style.display = 'block';
        
        try {
            // Make API request to your backend
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    niche: niche 
                })
            });
            
            // Check for errors
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            // Process response
            const data = await response.json();
            
            if (data.success) {
                displayResults(data.data);
            } else {
                throw new Error(data.error || 'Unknown error from server');
            }
            
        } catch (error) {
            // Handle errors
            console.error('Error fetching data:', error);
            showError(error.message || 'Failed to fetch questions. Please try again.');
        } finally {
            // Reset loading state
            fetchBtn.disabled = false;
            fetchBtn.classList.remove('loading');
            loader.style.display = 'none';
        }
    });
    
    // Display results in the container
    function displayResults(content) {
        const entries = content.split('\n\n').filter(entry => entry.trim() !== '');
        
        entries.forEach(entry => {
            if (!entry.includes('Question:') || !entry.includes('Product Idea:')) {
                return;
            }
            
            const question = extractValue(entry, 'Question:');
            const niche = extractValue(entry, 'Niche:');
            const product = extractValue(entry, 'Product Idea:');
            const monetization = extractValue(entry, 'Monetization:');
            
            if (question && product) {
                const card = document.createElement('div');
                card.className = 'maq-card';
                
                card.innerHTML = `
                    <button class="maq-copy-btn" title="Copy to clipboard">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                    <div class="maq-question">${question}</div>
                    <div class="maq-niche">${niche || 'General'}</div>
                    <div class="maq-product"><strong>Product Idea:</strong> ${product}</div>
                    ${monetization ? `<div class="maq-monetization"><strong>Monetization:</strong> <span>${monetization}</span></div>` : ''}
                `;
                
                resultsContainer.appendChild(card);
                
                // Add click handler to copy button
                const copyBtn = card.querySelector('.maq-copy-btn');
                copyBtn.addEventListener('click', () => {
                    const cardText = `${question}\n\nNiche: ${niche || 'General'}\n\nProduct Idea: ${product}${monetization ? `\n\nMonetization: ${monetization}` : ''}`;
                    copyToClipboard(cardText, copyBtn);
                });
            }
        });
        
        if (resultsContainer.children.length > 0) {
            resultsContainer.style.display = 'block';
            document.querySelector('.maq-copy-all-container').style.display = 'block';
            
            // Add click handler to copy all button
            copyAllBtn.addEventListener('click', () => {
                const allCards = Array.from(document.querySelectorAll('.maq-card'));
                let allText = '';
                
                allCards.forEach((card, index) => {
                    const question = card.querySelector('.maq-question').textContent;
                    const niche = card.querySelector('.maq-niche').textContent;
                    const product = card.querySelector('.maq-product').textContent.replace('Product Idea: ', '');
                    const monetization = card.querySelector('.maq-monetization') ? 
                        card.querySelector('.maq-monetization').textContent.replace('Monetization: ', '') : '';
                    
                    allText += `${index + 1}. ${question}\nNiche: ${niche}\nProduct Idea: ${product}`;
                    if (monetization) {
                        allText += `\nMonetization: ${monetization}`;
                    }
                    allText += '\n\n';
                });
                
                copyToClipboard(allText, copyAllBtn);
            });
        } else {
            showError('No valid questions found in the response.');
        }
    }
    
    // Extract value from text based on key
    function extractValue(text, key) {
        const startIndex = text.indexOf(key);
        if (startIndex === -1) return null;
        
        const endIndex = text.indexOf('\n', startIndex);
        const value = endIndex === -1 
            ? text.substring(startIndex + key.length).trim()
            : text.substring(startIndex + key.length, endIndex).trim();
        
        return value || null;
    }
    
    // Show error message
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
    
    // Copy text to clipboard
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            // Change button text temporarily
            const originalText = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                </svg>
                Copied!
            `;
            
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text to clipboard');
        });
    }
});
