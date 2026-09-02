document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    // Fetch article from Firestore cloud (or local cache)
    let article = null;
    if (id) {
        article = await getArticleByIdAsync(id);
    } else {
        const articles = await getArticlesAsync();
        article = articles[0];
    }

    if (!article) {
        document.getElementById('dynamic-landing-content').innerHTML = '<div style="text-align:center; padding: 60px 20px; font-family: sans-serif;"><h1>Article not found</h1><p style="color:#666;">The requested story could not be loaded or may have been removed.</p><a href="index.html" style="color:#E53935; font-weight:bold; text-decoration:none;">&larr; Back to Homepage</a></div>';
        return;
    }

    // Update document title for SEO
    document.title = article.title;
    // --- TRAFFIC TRACKING ---
    if (typeof logTrafficAsync === 'function') {
        logTrafficAsync(article.title || 'Untitled Article', window.location.pathname + window.location.search);
    }

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
            
            // Clean up unused/unfilled predefined top/bottom ad slots (keep active sidebar slots)
            contentContainer.querySelectorAll('.ad-horizontal, .ad-vertical').forEach(el => {
                if (el.style.display === 'none') {
                    el.remove();
                }
            });
            
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

    // --- AD INJECTION SYSTEM (Cloud Synced) ---
    const adSettings = await getAdSettingsAsync();
    // Fetching the correct keys saved by the Admin Panel
    const adBannerCode = adSettings['728'] || adSettings['300'] || adSettings['160'] || '';
    const adPopunderCode = adSettings['popunder'] || adSettings['social'] || '';

    // 1. Social Bar/Popunder Script (Global Body Injection)
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

    // 2. Banner Ad Injection (Fills both Dragged Ad Blocks & Middle of Article & Sidebar)
    if (contentContainer) {
        const manualAdBlocks = contentContainer.querySelectorAll('.ad-inline, .ad-square, .ad-horizontal, .ad-vertical, [data-type="ad"], #ad-sidebar');
        
        function renderAdInContainer(container) {
            container.innerHTML = '';
            container.style.border = 'none';
            container.style.background = 'transparent';
            container.style.margin = '36px auto 16px auto'; // Clean top margin so it doesn't touch article text
            container.style.padding = '0';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.width = '100%';
            container.style.height = 'auto';
            container.style.minHeight = '280px';
            
            // Create clean isolated iframe to guarantee native / third-party script execution without squashing
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.border = 'none';
            iframe.style.overflow = 'hidden';
            iframe.style.height = '100%';
            iframe.style.minHeight = '280px';
            iframe.scrolling = 'no';
            
            // Adjust dimensions specifically for vertical sidebar ads
            if (container.classList.contains('ad-vertical') || container.id === 'ad-sidebar') {
                iframe.style.minHeight = '600px';
                container.style.minHeight = '600px';
                container.style.margin = '0 auto'; // No top margin needed for sidebar
                
                // Force parent sidebar to be fully visible and active
                const sidebarParent = container.closest('.article-sidebar');
                if (sidebarParent) {
                    sidebarParent.classList.add('active');
                    sidebarParent.style.display = 'block';
                }
            }
            
            container.appendChild(iframe);
            
            const doc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
            doc.document.open();
            doc.document.write(`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;display:flex;justify-content:center;align-items:flex-start;background:transparent;overflow:hidden;width:100%;height:100%;}</style></head><body>${adBannerCode}</body></html>`);
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


