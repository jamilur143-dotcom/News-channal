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
            
            // Clean up admin dropzone dashed borders and excessive margins
            const dropzoneEl = contentContainer.querySelector('#dropzone');
            if (dropzoneEl) {
                dropzoneEl.style.border = 'none';
                dropzoneEl.style.padding = '0';
                dropzoneEl.style.margin = '0';
            }
            
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
        const adContainer = document.getElementById('ad-settings-container') || document.body;
        const temp = document.createElement('div');
        temp.innerHTML = adPopunderCode;
        Array.from(temp.childNodes).forEach(node => {
            if (node.tagName && node.tagName.toLowerCase() === 'script') {
                const script = document.createElement('script');
                Array.from(node.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
                script.text = node.textContent;
                adContainer.appendChild(script);
            } else {
                adContainer.appendChild(node.cloneNode(true));
            }
        });
    }

    // 2. Banner Ad Injection (Fills both Dragged Ad Blocks & Middle of Article)
    if (contentContainer) {
        const manualAdBlocks = contentContainer.querySelectorAll('.ad-inline, .ad-square, .ad-horizontal, .ad-vertical, [data-type="ad"]');
        
        function renderAdInContainer(container) {
            container.innerHTML = '';
            container.style.border = 'none';
            container.style.background = 'transparent';
            container.style.margin = '12px auto 0px auto';
            container.style.padding = '0';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.width = '100%';
            
            // Create clean isolated iframe to guarantee native / third-party script execution
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.border = 'none';
            iframe.style.overflow = 'hidden';
            iframe.style.minHeight = '320px'; // Increased height so titles/captions are not cut off
            iframe.scrolling = 'no';
            container.appendChild(iframe);
            
            const doc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
            doc.document.open();
            doc.document.write(`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;display:flex;justify-content:center;align-items:flex-start;background:transparent;overflow:hidden;}</style></head><body>${adBannerCode}</body></html>`);
            doc.document.close();
        }

        if (adBannerCode && adBannerCode.trim() !== '') {
            let injectedManually = false;
            
            manualAdBlocks.forEach(adBlock => {
                renderAdInContainer(adBlock);
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
                    renderAdInContainer(adWrapper);

                    targetNode.parentNode.insertBefore(adWrapper, targetNode.nextSibling);
                }
            }
        } else {
            // No Banner Code provided: Remove all empty ad placeholders from the live page so they don't show dummy text
            manualAdBlocks.forEach(adBlock => adBlock.remove());
        }
    }
});
