document.addEventListener('DOMContentLoaded', async () => {
    // --- TRAFFIC TRACKING ---
    if (typeof logTrafficAsync === 'function') {
        logTrafficAsync('News Homepage', window.location.pathname);
    }

    let allArticles = await getArticlesAsync();
    const articles = allArticles ? allArticles.filter(art => art.status !== 'Draft') : [];
    if (articles.length === 0) return;

    // The most recently published article always shifts to the Hero Section
    const hero = articles[0];
    // Older articles get pushed down to the Grid
    const gridArticles = articles.slice(1);

    /* â”€â”€ Render Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const heroContainer = document.getElementById('dynamic-hero');
    if (heroContainer) {
        let heroHtml = '';
        if (hero.media) {
            heroHtml += `<img src="${hero.media}" class="hero-bg-img" alt="Cover Image" />`;
        } else {
            heroHtml += `<div class="hero-bg-img" style="background: linear-gradient(135deg, #1a237e, #5c6bc0);"></div>`;
        }
        
        heroHtml += `
          <div class="hero-content">
            <span class="badge badge-breaking">ðŸ”´ Latest Post</span>
            <h1>${hero.title}</h1>
            <p>${hero.excerpt || 'Read the full story to learn more about this breaking development.'}</p>
            <div class="hero-meta">
              <span>âœï¸ Nexus Desk</span>
              <span>ðŸ•’ <time>${new Date(hero.date).toLocaleDateString()}</time></span>
            </div>
            <div class="hero-cta">
              <a href="landing.html?id=${hero.id}" class="btn btn-accent">Read Full Story</a>
            </div>
          </div>
        `;
        heroContainer.innerHTML = heroHtml;
    }

    /* â”€â”€ Render Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const gridContainer = document.getElementById('dynamic-news-grid');
    if (gridContainer) {
        const gridHtml = gridArticles.map((article, index) => {
            const defaultIcons = ['ðŸ›ï¸', 'ðŸ’»', 'ðŸŒ', 'âš½', 'ðŸ“ˆ', 'ðŸŽ¬'];
            const icon = defaultIcons[index % defaultIcons.length];

            let imgHtml = article.media 
                ? `<img src="${article.media}" alt="Thumbnail" />` 
                : `<div class="card-img-icon">${icon}</div>`;

            return `
            <article class="card news-card">
              <div class="card-img-wrap">
                ${imgHtml}
              </div>
              <div class="card-body">
                <div class="card-meta">
                  <span class="badge badge-primary">${article.category || 'News'}</span>
                  <span class="text-muted" style="font-size:.75rem">${new Date(article.date).toLocaleDateString()}</span>
                </div>
                <h2 class="card-title"><a href="landing.html?id=${article.id}">${article.title}</a></h2>
                <p class="card-excerpt">${article.excerpt || 'Click to read more about this topic.'}</p>
                <div class="card-footer">
                  <div class="author-info">
                    <div class="author-avatar">NN</div>
                    <span class="text-muted" style="font-size:.78rem">Nexus Desk</span>
                  </div>
                  <a href="landing.html?id=${article.id}" class="read-more">Read More</a>
                </div>
              </div>
            </article>
            `;
        }).join('');
        
        gridContainer.innerHTML = gridHtml;
    }
    /* â”€â”€ Inject Adsterra Ads (Cloud Synced) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const adSettings = await getAdSettingsAsync();
    const adBannerCode = adSettings.bannerCode || localStorage.getItem('adBannerCode');
    const adPopunderCode = adSettings.popunderCode || localStorage.getItem('adPopunderCode');

    // 1. Inject Popunder / Social Bar Script
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

    // 2. Inject Banner Ads to Sidebar and Main Banner slots if code exists
    if (adBannerCode && adBannerCode.trim() !== '') {
        const adZones = document.querySelectorAll('.ad-zone');
        adZones.forEach((zone, idx) => {
            zone.innerHTML = '';
            zone.style.background = 'transparent';
            zone.style.border = 'none';
            
            // Only inject the main ad code once into the top banner, or load via iframe/isolated container
            // If the code has a specific container ID, Adsterra targets that exact container ID.
            // Having duplicate IDs on the same page breaks Adsterra. So we create unique wrappers.
            if (idx === 0) {
                zone.innerHTML = adBannerCode;
                Array.from(zone.querySelectorAll('script')).forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.text = oldScript.textContent;
                    oldScript.replaceWith(newScript);
                });
            } else {
                // For sidebar slots, use a clean isolated iframe sandbox to render the ad unit
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.border = 'none';
                iframe.style.overflow = 'hidden';
                iframe.style.minHeight = '250px';
                iframe.scrolling = 'no';
                zone.appendChild(iframe);
                
                const doc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
                doc.document.open();
                doc.document.write(`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;}</style></head><body>${adBannerCode}</body></html>`);
                doc.document.close();
            }
        });
    }
});

