/* ============================================================
   NEXUSNEWS — Global JavaScript
   Sticky header · Mobile nav · Language switcher · Smooth scroll
   ============================================================ */

(function () {
  'use strict';

  /* ── Sticky Header ────────────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () =>
      header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile Nav Toggle ────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
    // Close on outside click
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Language Switcher ────────────────────────────────── */
  const translations = {
    en: {
      'nav-home':          'Home',
      'nav-politics':      'Politics',
      'nav-tech':          'Technology',
      'nav-sports':        'Sports',
      'nav-entertainment': 'Entertainment',
      'nav-world':         'World',
      'nav-business':      'Business',
      'search-placeholder':'Search news…',
    },
    bn: {
      'nav-home':          'হোম',
      'nav-politics':      'রাজনীতি',
      'nav-tech':          'প্রযুক্তি',
      'nav-sports':        'খেলাধুলা',
      'nav-entertainment': 'বিনোদন',
      'nav-world':         'বিশ্ব',
      'nav-business':      'ব্যবসা',
      'search-placeholder':'সংবাদ খুঁজুন…',
    },
    fr: {
      'nav-home':          'Accueil',
      'nav-politics':      'Politique',
      'nav-tech':          'Technologie',
      'nav-sports':        'Sports',
      'nav-entertainment': 'Divertissement',
      'nav-world':         'Monde',
      'nav-business':      'Affaires',
      'search-placeholder':'Rechercher…',
    },
    es: {
      'nav-home':          'Inicio',
      'nav-politics':      'Política',
      'nav-tech':          'Tecnología',
      'nav-sports':        'Deportes',
      'nav-entertainment': 'Entretenimiento',
      'nav-world':         'Mundo',
      'nav-business':      'Negocios',
      'search-placeholder':'Buscar noticias…',
    },
    ar: {
      'nav-home':          'الرئيسية',
      'nav-politics':      'سياسة',
      'nav-tech':          'تكنولوجيا',
      'nav-sports':        'رياضة',
      'nav-entertainment': 'ترفيه',
      'nav-world':         'العالم',
      'nav-business':      'أعمال',
      'search-placeholder':'ابحث عن الأخبار…',
    },
  };

  const langSelect = document.querySelector('.lang-select');
  if (langSelect) {
    const applyLang = lang => {
      const t = translations[lang] || translations.en;
      document.documentElement.lang = lang;
      document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (t[key]) el.placeholder = t[key];
      });
    };
    langSelect.addEventListener('change', e => applyLang(e.target.value));
  }

  /* ── Active Nav Highlight ────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Smooth Scroll ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Search Expand / Collapse (desktop) ──────────────── */
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') searchInput.blur();
    });
  }

  /* ── Reading Progress Bar ────────────────────────────── */
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const el   = document.documentElement;
      const top  = el.scrollTop  || document.body.scrollTop;
      const h    = el.scrollHeight - el.clientHeight;
      const pct  = h > 0 ? (top / h) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

})();
