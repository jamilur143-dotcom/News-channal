document.addEventListener('DOMContentLoaded', () => {
    const articles = getArticles();
    if (articles.length === 0) return;

    // The most recently published article always shifts to the Hero Section
    const hero = articles[0];
    // Older articles get pushed down to the Grid
    const gridArticles = articles.slice(1);

    /* ── Render Hero ──────────────────────────────────────── */
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
            <span class="badge badge-breaking">🔴 Latest Post</span>
            <h1>${hero.title}</h1>
            <p>${hero.excerpt || 'Read the full story to learn more about this breaking development.'}</p>
            <div class="hero-meta">
              <span>✍️ Nexus Desk</span>
              <span>🕒 <time>${new Date(hero.date).toLocaleDateString()}</time></span>
            </div>
            <div class="hero-cta">
              <a href="landing.html?id=${hero.id}" class="btn btn-accent">Read Full Story</a>
            </div>
          </div>
        `;
        heroContainer.innerHTML = heroHtml;
    }

    /* ── Render Grid ──────────────────────────────────────── */
    const gridContainer = document.getElementById('dynamic-news-grid');
    if (gridContainer) {
        const gridHtml = gridArticles.map((article, index) => {
            const defaultIcons = ['🏛️', '💻', '🌍', '⚽', '📈', '🎬'];
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
});
