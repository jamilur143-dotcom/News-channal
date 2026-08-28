/* ============================================================
   NEXUSNEWS — Home Page JavaScript
   Filter tabs · Ticker · Lazy load · Load more · Timestamp
   ============================================================ */

(function () {
  'use strict';

  /* ── Filter Tabs ─────────────────────────────────────── */
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.news-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.category;
      cards.forEach(card => {
        const matches = cat === 'all' || card.dataset.category === cat;
        card.style.display = matches ? '' : 'none';
        if (matches) {
          card.style.animation = 'none';
          requestAnimationFrame(() => {
            card.style.animation = '';
            card.classList.add('fade-in');
          });
        }
      });
    });
  });

  /* ── Ticker: duplicate items for seamless loop ────────── */
  const track = document.querySelector('.ticker-track');
  if (track) {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentElement.appendChild(clone);
    // Pause on hover
    track.parentElement.addEventListener('mouseenter', () => {
      [track, clone].forEach(t => (t.style.animationPlayState = 'paused'));
    });
    track.parentElement.addEventListener('mouseleave', () => {
      [track, clone].forEach(t => (t.style.animationPlayState = 'running'));
    });
  }

  /* ── Lazy Load Images ─────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          io.unobserve(img);
        }
      }),
      { rootMargin: '200px' }
    );
    document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
  } else {
    // Fallback
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
  }

  /* ── Load More Button ─────────────────────────────────── */
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    let page = 1;
    const maxPages = 3;
    loadMoreBtn.addEventListener('click', () => {
      if (page >= maxPages) {
        loadMoreBtn.textContent = 'No more articles';
        loadMoreBtn.disabled = true;
        return;
      }
      loadMoreBtn.textContent = 'Loading…';
      loadMoreBtn.disabled = true;
      // Simulate async fetch
      setTimeout(() => {
        page++;
        const grid = document.querySelector('.news-grid');
        if (grid) {
          for (let i = 0; i < 3; i++) {
            const card = createPlaceholderCard();
            grid.appendChild(card);
          }
        }
        loadMoreBtn.textContent = page >= maxPages ? 'No more articles' : 'Load More Articles';
        loadMoreBtn.disabled = page >= maxPages;
      }, 700);
    });
  }

  function createPlaceholderCard() {
    const categories = ['Politics', 'Technology', 'Sports', 'Entertainment', 'World'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const emojis = ['📰', '💡', '🏆', '🎬', '🌍'];
    const idx = categories.indexOf(cat);

    const div = document.createElement('div');
    div.className = 'card news-card';
    div.dataset.category = cat.toLowerCase();
    div.style.animation = 'fadeInUp .4s ease both';
    div.innerHTML = `
      <div class="card-img-wrap">
        <div class="card-img-icon">${emojis[idx]}</div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="badge badge-${cat.toLowerCase() === 'politics' ? 'politics' : cat.toLowerCase() === 'technology' ? 'tech' : cat.toLowerCase() === 'sports' ? 'sports' : cat.toLowerCase() === 'entertainment' ? 'entertainment' : 'world'}">${cat}</span>
          <span class="text-muted" style="font-size:.75rem">${Math.floor(Math.random()*50)+1} min ago</span>
        </div>
        <h2 class="card-title"><a href="article.html">Breaking story in ${cat} shakes world stage</a></h2>
        <p class="card-excerpt">Latest developments in this rapidly evolving story as experts weigh in on the implications for the global community.</p>
        <div class="card-footer">
          <div class="author-info">
            <div class="author-avatar">NN</div>
            <span class="text-muted" style="font-size:.78rem">NexusNews Desk</span>
          </div>
          <a href="article.html" class="read-more">Read More</a>
        </div>
      </div>`;
    return div;
  }

  /* ── Relative Timestamps ─────────────────────────────── */
  function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  }
  document.querySelectorAll('[data-timestamp]').forEach(el => {
    el.textContent = timeAgo(el.dataset.timestamp);
    el.title = new Date(el.dataset.timestamp).toLocaleString();
  });

  /* ── Fade-in animation for cards ─────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .news-card { animation: fadeInUp .4s ease both; }
    .news-card:nth-child(2) { animation-delay:.06s; }
    .news-card:nth-child(3) { animation-delay:.12s; }
    .news-card:nth-child(4) { animation-delay:.18s; }
    .news-card:nth-child(5) { animation-delay:.24s; }
    .news-card:nth-child(6) { animation-delay:.30s; }
  `;
  document.head.appendChild(style);

})();
