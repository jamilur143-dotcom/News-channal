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
        } else {
            // Fallback for old articles
            contentContainer.innerHTML = `
                <div class="visual-canvas" style="border:none; margin:0; border-radius:0;">
                    ${article.content}
                </div>
            `;
        }
    }
});
