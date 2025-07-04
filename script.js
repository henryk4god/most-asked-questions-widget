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
    
    // API configuration
    const API_KEY = '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';
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    
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
            // Build prompt based on niche
            let prompt = `Generate 10 of the most frequently asked online questions`;
            
            if (niche) {
                prompt += ` specifically in the ${niche} niche`;
            } else {
                prompt += ` across diverse niches`;
            }
            
            prompt += `, focusing on trending topics not older than six months with proven market demand indicated by active paid advertising campaigns. For each question, propose a scalable product idea that addresses the underlying problem or need, ensuring the solution can be monetized as either a digital product, physical item, or SaaS platform. Each product concept should meet the following criteria:
            
            1. Ads Prove Demand: The question must have significant ad spend, indicating existing consumer interest and willingness to invest in solutions.
            2. Multiple Monetization Paths: Offer flexibility for selling as a digital download (e.g., eBook, course), physical product (e.g., kits, tools), or recurring revenue model (e.g., app, subscription).
            3. Scalable Infrastructure: Ensure low overhead costs for digital products and leverage print-on-demand or efficient manufacturing for physical goods.
            
            Present your findings in a structured format, including the trending question, associated niche, and detailed product idea with potential upsells or extensions. Use recent trends from the past three months to ensure relevance and timeliness.
            
            Format each entry as:
            Question: [The question]
            Niche: [The niche/category]
            Product Idea: [The product solution]
            Monetization: [How it can be monetized]`;
            
            // Make API request
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Most Asked Questions Widget'
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat:free",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });
            
            // Check for errors
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            // Process response
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Display results
            displayResults(content);
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
