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

    // Because we now use a Drag and Drop Page Builder, 
    // the 'article.content' contains the EXACT fully-designed HTML (Image, H1, Ads, Paragraphs).
    // We just inject it.
    
    // 1. Remove the static hero-media placeholder container from landing.html since the builder provides its own image block
    const mediaContainer = document.getElementById('dynamic-landing-media');
    if(mediaContainer) {
        mediaContainer.remove(); 
    }

    // 2. Inject the entire built page into the content container
    const contentContainer = document.getElementById('dynamic-landing-content');
    if (contentContainer) {
        // Strip the container's default constraints so the hero image can go full width if needed
        contentContainer.style.maxWidth = '100%';
        contentContainer.style.padding = '0';
        
        if (article.fullHTML) {
            // New rendering logic: exact copy of admin canvas
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
                    heroMedia.innerHTML = `<img src="${article.media}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; display:block;" />`;
                }
            }
        } else {
            // Fallback for old articles
            contentContainer.innerHTML = `
                <div class="visual-canvas" style="border:none; margin:0; border-radius:0;">
                    ${article.content}
                </div>
            `;
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
                if (node.src) script.src = node.src;
                script.text = node.textContent;
                document.body.appendChild(script);
            } else {
                document.body.appendChild(node.cloneNode(true));
            }
        });
    }

    // 2. Middle Paragraph Banner Ad
    if (adBannerCode && adBannerCode.trim() !== '') {
        // Find paragraphs within the content container
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
            
            // Re-evaluate scripts in the banner if any
            Array.from(adWrapper.querySelectorAll('script')).forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) newScript.src = oldScript.src;
                newScript.text = oldScript.textContent;
                oldScript.replaceWith(newScript);
            });

            targetNode.parentNode.insertBefore(adWrapper, targetNode.nextSibling);
        }
    }
});

