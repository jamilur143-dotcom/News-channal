document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const articles = getArticles();
    
    // If an ID is provided, load that specific article.
    const article = id ? getArticleById(id) : articles[0];

    if (!article) {
        document.getElementById('dynamic-landing-content').innerHTML = '<h1>Article not found</h1>';
        return;
    }

    // Update document title for SEO
    document.title = article.title;

    // 1. Remove the static hero-media placeholder container from landing.html since the builder provides its own image block
    const mediaContainer = document.getElementById('dynamic-landing-media');
    if(mediaContainer) {
        mediaContainer.remove(); 
    }

    // 2. Inject the entire built page into the content container
    const contentContainer = document.getElementById('dynamic-landing-content');
    if (contentContainer) {
        contentContainer.style.maxWidth = '100%';
        contentContainer.style.padding = '0';
        
        if (article.fullHTML) {
            contentContainer.innerHTML = article.fullHTML;
            
            // Ensure hero media container and image are properly rendered
            const heroImg = contentContainer.querySelector('#default-hero-img, .hero-media img');
            if (heroImg) {
                if (!heroImg.src && article.media) {
                    heroImg.src = article.media;
                }
                if (heroImg.src && !heroImg.src.endsWith('/') && !heroImg.src.endsWith('.html')) {
                    heroImg.style.display = 'block';
                    heroImg.style.position = 'absolute';
                    heroImg.style.top = '0';
                    heroImg.style.left = '0';
                    heroImg.style.width = '100%';
                    heroImg.style.height = '100%';
                    heroImg.style.objectFit = 'cover';
                }
            } else if (article.media) {
                const heroMedia = contentContainer.querySelector('.hero-media');
                if (heroMedia) {
                    heroMedia.innerHTML = '<img src="' + article.media + '" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; display:block;" />';
                }
            }
        } else {
            // Fallback for old articles
            contentContainer.innerHTML = '<div class="visual-canvas" style="border:none; margin:0; border-radius:0;">' + article.content + '</div>';
        }
    }

    // --- AD INJECTION SYSTEM ---
    const adBannerCode = localStorage.getItem('adBannerCode');
    const adPopunderCode = localStorage.getItem('adPopunderCode');

    // 1. Social Bar/Popunder Script (Header/Footer Injection)
    if (adPopunderCode && adPopunderCode.trim() !== '') {
        const temp = document.createElement('div');
        temp.innerHTML = adPopunderCode;
        Array.from(temp.childNodes).forEach(node => {
            if (node.tagName && node.tagName.toLowerCase() === 'script') {
                const script = document.createElement('script');
                Array.from(node.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
                script.text = node.textContent;
                document.body.appendChild(script);
            } else {
                document.body.appendChild(node.cloneNode(true));
            }
        });
    }

    // 2. Banner Ad Injection (Fills both Dragged Ad Blocks & Middle of Article)
    if (contentContainer) {
        const manualAdBlocks = contentContainer.querySelectorAll('.ad-inline, .ad-square, .ad-horizontal, .ad-vertical');
        
        if (adBannerCode && adBannerCode.trim() !== '') {
            let injectedManually = false;
            
            manualAdBlocks.forEach(adBlock => {
                adBlock.innerHTML = ''; // clear placeholder text
                adBlock.style.border = 'none';
                adBlock.style.background = 'transparent';
                adBlock.innerHTML = adBannerCode;
                
                // Re-evaluate scripts in the banner if any
                Array.from(adBlock.querySelectorAll('script')).forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.text = oldScript.textContent;
                    oldScript.replaceWith(newScript);
                });
                injectedManually = true;
            });

            // If they didn't drag any manual ad blocks, automatically inject one in the middle of the article
            if (!injectedManually) {
                const paragraphs = Array.from(contentContainer.querySelectorAll('.article-text, p')).filter(p => p.textContent.trim().length > 20);
                if (paragraphs.length > 0) {
                    const middleIndex = Math.floor(paragraphs.length / 2);
                    const targetNode = paragraphs[middleIndex];
                    
                    const adWrapper = document.createElement('div');
                    adWrapper.className = 'in-content-ad';
                    adWrapper.style.margin = '32px auto';
                    adWrapper.style.textAlign = 'center';
                    adWrapper.style.display = 'flex';
                    adWrapper.style.justifyContent = 'center';
                    adWrapper.innerHTML = adBannerCode;
                    
                    // Re-evaluate scripts
                    Array.from(adWrapper.querySelectorAll('script')).forEach(oldScript => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.text = oldScript.textContent;
                        oldScript.replaceWith(newScript);
                    });

                    targetNode.parentNode.insertBefore(adWrapper, targetNode.nextSibling);
                }
            }
        } else {
            // No Banner Code provided: Remove all empty ad placeholders from the live page so they don't show dummy text
            manualAdBlocks.forEach(adBlock => adBlock.remove());
        }
    }
});
