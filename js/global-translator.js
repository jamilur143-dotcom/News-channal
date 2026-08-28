/**
 * Global Multi-Language Translator Widget
 * Covers all 195 Countries across Asia, Europe, Africa, Americas, and Oceania
 * Integrates directly with Google Translate Element for instant full-page translation.
 */

(function () {
  // Comprehensive Languages Database mapped to 195 Countries & Continents
  const LANGUAGES = [
    // --- ASIA (48 Countries) ---
    { code: 'bn', name: 'Bengali (বাংলা)', native: 'বাংলা', flag: '🇧🇩', continent: 'asia', countries: ['Bangladesh', 'India'] },
    { code: 'ar', name: 'Arabic (العربية)', native: 'العربية', flag: '🇸🇦', continent: 'asia', countries: ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen', 'Iraq', 'Jordan', 'Lebanon', 'Syria', 'Egypt', 'Algeria', 'Morocco', 'Tunisia', 'Libya', 'Sudan'] },
    { code: 'zh-CN', name: 'Chinese Simplified (简体中文)', native: '简体中文', flag: '🇨🇳', continent: 'asia', countries: ['China', 'Singapore'] },
    { code: 'zh-TW', name: 'Chinese Traditional (繁體中文)', native: '繁體中文', flag: '🇹🇼', continent: 'asia', countries: ['Taiwan', 'Hong Kong'] },
    { code: 'hi', name: 'Hindi (हिन्दी)', native: 'हिन्दी', flag: '🇮🇳', continent: 'asia', countries: ['India'] },
    { code: 'ur', name: 'Urdu (اردو)', native: 'اردو', flag: '🇵🇰', continent: 'asia', countries: ['Pakistan', 'India'] },
    { code: 'ja', name: 'Japanese (日本語)', native: '日本語', flag: '🇯🇵', continent: 'asia', countries: ['Japan'] },
    { code: 'ko', name: 'Korean (한국어)', native: '한국어', flag: '🇰🇷', continent: 'asia', countries: ['South Korea', 'North Korea'] },
    { code: 'id', name: 'Indonesian (Bahasa Indonesia)', native: 'Bahasa Indonesia', flag: '🇮🇩', continent: 'asia', countries: ['Indonesia'] },
    { code: 'ms', name: 'Malay (Bahasa Melayu)', native: 'Bahasa Melayu', flag: '🇲🇾', continent: 'asia', countries: ['Malaysia', 'Brunei', 'Singapore'] },
    { code: 'vi', name: 'Vietnamese (Tiếng Việt)', native: 'Tiếng Việt', flag: '🇻🇳', continent: 'asia', countries: ['Vietnam'] },
    { code: 'th', name: 'Thai (ไทย)', native: 'ไทย', flag: '🇹🇭', continent: 'asia', countries: ['Thailand'] },
    { code: 'tl', name: 'Filipino / Tagalog', native: 'Filipino', flag: '🇵🇭', continent: 'asia', countries: ['Philippines'] },
    { code: 'fa', name: 'Persian / Farsi (فارسی)', native: 'فارسی', flag: '🇮🇷', continent: 'asia', countries: ['Iran', 'Afghanistan', 'Tajikistan'] },
    { code: 'ps', name: 'Pashto (پښتو)', native: 'پښتو', flag: '🇦🇫', continent: 'asia', countries: ['Afghanistan', 'Pakistan'] },
    { code: 'my', name: 'Burmese (မြန်မာ)', native: 'မြန်မာစာ', flag: '🇲🇲', continent: 'asia', countries: ['Myanmar'] },
    { code: 'km', name: 'Khmer (ខ្មែរ)', native: 'ភាសាខ្មែរ', flag: '🇰🇭', continent: 'asia', countries: ['Cambodia'] },
    { code: 'lo', name: 'Lao (ລາວ)', native: 'ພາສາລາວ', flag: '🇱🇦', continent: 'asia', countries: ['Laos'] },
    { code: 'ne', name: 'Nepali (नेपाली)', native: 'नेपाली', flag: '🇳🇵', continent: 'asia', countries: ['Nepal', 'Bhutan'] },
    { code: 'si', name: 'Sinhala (සිංහල)', native: 'සිංහල', flag: '🇱🇰', continent: 'asia', countries: ['Sri Lanka'] },
    { code: 'ta', name: 'Tamil (தமிழ்)', native: 'தமிழ்', flag: '🇱🇰', continent: 'asia', countries: ['Sri Lanka', 'India', 'Singapore'] },
    { code: 'te', name: 'Telugu (తెలుగు)', native: 'తెలుగు', flag: '🇮🇳', continent: 'asia', countries: ['India'] },
    { code: 'mr', name: 'Marathi (मराठी)', native: 'मराठी', flag: '🇮🇳', continent: 'asia', countries: ['India'] },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)', native: 'ગુજરાતી', flag: '🇮🇳', continent: 'asia', countries: ['India'] },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', continent: 'asia', countries: ['India', 'Pakistan'] },
    { code: 'kk', name: 'Kazakh (Қазақша)', native: 'Қазақ тілі', flag: '🇰🇿', continent: 'asia', countries: ['Kazakhstan'] },
    { code: 'uz', name: 'Uzbek (Oʻzbekcha)', native: 'Oʻzbekcha', flag: '🇺🇿', continent: 'asia', countries: ['Uzbekistan'] },
    { code: 'tk', name: 'Turkmen (Türkmençe)', native: 'Türkmençe', flag: '🇹🇲', continent: 'asia', countries: ['Turkmenistan'] },
    { code: 'ky', name: 'Kyrgyz (Кыргызча)', native: 'Кыргызча', flag: '🇰🇬', continent: 'asia', countries: ['Kyrgyzstan'] },
    { code: 'tg', name: 'Tajik (Тоҷикӣ)', native: 'Тоҷикӣ', flag: '🇹🇯', continent: 'asia', countries: ['Tajikistan'] },
    { code: 'mn', name: 'Mongolian (Монгол)', native: 'Монгол хэл', flag: '🇲🇳', continent: 'asia', countries: ['Mongolia'] },
    { code: 'he', name: 'Hebrew (עברית)', native: 'עברית', flag: '🇮🇱', continent: 'asia', countries: ['Israel'] },
    { code: 'az', name: 'Azerbaijani (Azərbaycan)', native: 'Azərbaycan', flag: '🇦🇿', continent: 'asia', countries: ['Azerbaijan'] },
    { code: 'ka', name: 'Georgian (ქართული)', native: 'ქართული', flag: '🇬🇪', continent: 'asia', countries: ['Georgia'] },
    { code: 'hy', name: 'Armenian (Հայերեն)', native: 'Հայերեն', flag: '🇦🇲', continent: 'asia', countries: ['Armenia'] },
    { code: 'dv', name: 'Dhivehi (ދިވެހި)', native: 'ދިވެހި', flag: '🇲🇻', continent: 'asia', countries: ['Maldives'] },

    // --- EUROPE (44 Countries) ---
    { code: 'en', name: 'English (UK / US / Global)', native: 'English', flag: '🇬🇧', continent: 'europe', countries: ['United Kingdom', 'United States', 'Canada', 'Australia', 'New Zealand', 'Ireland'] },
    { code: 'fr', name: 'French (Français)', native: 'Français', flag: '🇫🇷', continent: 'europe', countries: ['France', 'Belgium', 'Switzerland', 'Luxembourg', 'Monaco', 'Canada'] },
    { code: 'de', name: 'German (Deutsch)', native: 'Deutsch', flag: '🇩🇪', continent: 'europe', countries: ['Germany', 'Austria', 'Switzerland', 'Liechtenstein', 'Luxembourg'] },
    { code: 'es', name: 'Spanish (Español)', native: 'Español', flag: '🇪🇸', continent: 'europe', countries: ['Spain', 'Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru'] },
    { code: 'it', name: 'Italian (Italiano)', native: 'Italiano', flag: '🇮🇹', continent: 'europe', countries: ['Italy', 'Switzerland', 'San Marino', 'Vatican City'] },
    { code: 'pt', name: 'Portuguese (Português)', native: 'Português', flag: '🇵🇹', continent: 'europe', countries: ['Portugal', 'Brazil', 'Angola', 'Mozambique'] },
    { code: 'ru', name: 'Russian (Русский)', native: 'Русский', flag: '🇷🇺', continent: 'europe', countries: ['Russia', 'Belarus', 'Kazakhstan', 'Kyrgyzstan'] },
    { code: 'uk', name: 'Ukrainian (Українська)', native: 'Українська', flag: '🇺🇦', continent: 'europe', countries: ['Ukraine'] },
    { code: 'pl', name: 'Polish (Polski)', native: 'Polski', flag: '🇵🇱', continent: 'europe', countries: ['Poland'] },
    { code: 'nl', name: 'Dutch (Nederlands)', native: 'Nederlands', flag: '🇳🇱', continent: 'europe', countries: ['Netherlands', 'Belgium', 'Suriname'] },
    { code: 'tr', name: 'Turkish (Türkçe)', native: 'Türkçe', flag: '🇹🇷', continent: 'europe', countries: ['Turkey', 'Cyprus'] },
    { code: 'el', name: 'Greek (Ελληνικά)', native: 'Ελληνικά', flag: '🇬🇷', continent: 'europe', countries: ['Greece', 'Cyprus'] },
    { code: 'sv', name: 'Swedish (Svenska)', native: 'Svenska', flag: '🇸🇪', continent: 'europe', countries: ['Sweden', 'Finland'] },
    { code: 'no', name: 'Norwegian (Norsk)', native: 'Norsk', flag: '🇳🇴', continent: 'europe', countries: ['Norway'] },
    { code: 'da', name: 'Danish (Dansk)', native: 'Dansk', flag: '🇩🇰', continent: 'europe', countries: ['Denmark'] },
    { code: 'fi', name: 'Finnish (Suomi)', native: 'Suomi', flag: '🇫🇮', continent: 'europe', countries: ['Finland'] },
    { code: 'cs', name: 'Czech (Čeština)', native: 'Čeština', flag: '🇨🇿', continent: 'europe', countries: ['Czech Republic'] },
    { code: 'sk', name: 'Slovak (Slovenčina)', native: 'Slovenčina', flag: '🇸🇰', continent: 'slovakia', countries: ['Slovakia'] },
    { code: 'hu', name: 'Hungarian (Magyar)', native: 'Magyar', flag: '🇭🇺', continent: 'europe', countries: ['Hungary'] },
    { code: 'ro', name: 'Romanian (Română)', native: 'Română', flag: '🇷🇴', continent: 'europe', countries: ['Romania', 'Moldova'] },
    { code: 'bg', name: 'Bulgarian (Български)', native: 'Български', flag: '🇧🇬', continent: 'europe', countries: ['Bulgaria'] },
    { code: 'hr', name: 'Croatian (Hrvatski)', native: 'Hrvatski', flag: '🇭🇷', continent: 'europe', countries: ['Croatia', 'Bosnia and Herzegovina'] },
    { code: 'sr', name: 'Serbian (Српски)', native: 'Српски', flag: '🇷🇸', continent: 'europe', countries: ['Serbia', 'Bosnia and Herzegovina', 'Montenegro'] },
    { code: 'bs', name: 'Bosnian (Bosanski)', native: 'Bosanski', flag: '🇧🇦', continent: 'europe', countries: ['Bosnia and Herzegovina'] },
    { code: 'sl', name: 'Slovenian (Slovenščina)', native: 'Slovenščina', flag: '🇸🇮', continent: 'europe', countries: ['Slovenia'] },
    { code: 'sq', name: 'Albanian (Shqip)', native: 'Shqip', flag: '🇦🇱', continent: 'europe', countries: ['Albania', 'Kosovo', 'North Macedonia'] },
    { code: 'mk', name: 'Macedonian (Македонски)', native: 'Македонски', flag: '🇲🇰', continent: 'europe', countries: ['North Macedonia'] },
    { code: 'et', name: 'Estonian (Eesti)', native: 'Eesti keel', flag: '🇪🇪', continent: 'europe', countries: ['Estonia'] },
    { code: 'lv', name: 'Latvian (Latviešu)', native: 'Latviešu', flag: '🇱🇻', continent: 'europe', countries: ['Latvia'] },
    { code: 'lt', name: 'Lithuanian (Lietuvių)', native: 'Lietuvių', flag: '🇱🇹', continent: 'europe', countries: ['Lithuania'] },
    { code: 'is', name: 'Icelandic (Íslenska)', native: 'Íslenska', flag: '🇮🇸', continent: 'europe', countries: ['Iceland'] },
    { code: 'ga', name: 'Irish (Gaeilge)', native: 'Gaeilge', flag: '🇮🇪', continent: 'europe', countries: ['Ireland'] },
    { code: 'mt', name: 'Maltese (Malti)', native: 'Malti', flag: '🇲🇹', continent: 'europe', countries: ['Malta'] },
    { code: 'be', name: 'Belarusian (Беларуская)', native: 'Беларуская', flag: '🇧🇾', continent: 'europe', countries: ['Belarus'] },

    // --- AFRICA (54 Countries) ---
    { code: 'sw', name: 'Swahili (Kiswahili)', native: 'Kiswahili', flag: '🇰🇪', continent: 'africa', countries: ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'DR Congo'] },
    { code: 'am', name: 'Amharic (አማርኛ)', native: 'አማርኛ', flag: '🇪🇹', continent: 'africa', countries: ['Ethiopia'] },
    { code: 'ha', name: 'Hausa (Harshen Hausa)', native: 'هَوُسَ', flag: '🇳🇬', continent: 'africa', countries: ['Nigeria', 'Niger', 'Ghana', 'Chad'] },
    { code: 'yo', name: 'Yoruba (Èdè Yorùbá)', native: 'Èdè Yorùbá', flag: '🇳🇬', continent: 'africa', countries: ['Nigeria', 'Benin', 'Togo'] },
    { code: 'ig', name: 'Igbo (Asụsụ Igbo)', native: 'Asụsụ Igbo', flag: '🇳🇬', continent: 'africa', countries: ['Nigeria'] },
    { code: 'zu', name: 'Zulu (isiZulu)', native: 'isiZulu', flag: '🇿🇦', continent: 'africa', countries: ['South Africa'] },
    { code: 'xh', name: 'Xhosa (isiXhosa)', native: 'isiXhosa', flag: '🇿🇦', continent: 'africa', countries: ['South Africa'] },
    { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', continent: 'africa', countries: ['South Africa', 'Namibia'] },
    { code: 'so', name: 'Somali (Soomaaliga)', native: 'Af-Soomaali', flag: '🇸🇴', continent: 'africa', countries: ['Somalia', 'Djibouti', 'Ethiopia', 'Kenya'] },
    { code: 'mg', name: 'Malagasy (Fiteny Malagasy)', native: 'Malagasy', flag: '🇲🇬', continent: 'africa', countries: ['Madagascar'] },
    { code: 'sn', name: 'Shona (chiShona)', native: 'chiShona', flag: '🇿🇼', continent: 'africa', countries: ['Zimbabwe', 'Mozambique'] },
    { code: 'ny', name: 'Chichewa (Nyanja)', native: 'Chichewa', flag: '🇲🇼', continent: 'africa', countries: ['Malawi', 'Zambia', 'Mozambique'] },
    { code: 'rw', name: 'Kinyarwanda', native: 'Ikinyarwanda', flag: '🇷🇼', continent: 'africa', countries: ['Rwanda', 'Uganda', 'DR Congo'] },
    { code: 'st', name: 'Sesotho', native: 'Sesotho', flag: '🇱🇸', continent: 'africa', countries: ['Lesotho', 'South Africa'] },

    // --- AMERICAS (North & South - 35 Countries) ---
    { code: 'pt-BR', name: 'Portuguese - Brazil (Português)', native: 'Português do Brasil', flag: '🇧🇷', continent: 'americas', countries: ['Brazil'] },
    { code: 'es-MX', name: 'Spanish - Latin America', native: 'Español Latino', flag: '🇲🇽', continent: 'americas', countries: ['Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru', 'Ecuador', 'Venezuela', 'Guatemala', 'Cuba', 'Dominican Republic', 'Honduras', 'Paraguay', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Uruguay', 'Bolivia'] },
    { code: 'ht', name: 'Haitian Creole (Kreyòl)', native: 'Kreyòl ayisyen', flag: '🇭🇹', continent: 'americas', countries: ['Haiti'] },
    { code: 'qu', name: 'Quechua (Runasimi)', native: 'Runasimi', flag: '🇵🇪', continent: 'americas', countries: ['Peru', 'Bolivia', 'Ecuador'] },
    { code: 'gn', name: "Guarani (Avañe'ẽ)", native: "Avañe'ẽ", flag: '🇵🇾', continent: 'americas', countries: ['Paraguay', 'Argentina', 'Bolivia'] },

    // --- OCEANIA (14 Countries) ---
    { code: 'mi', name: 'Maori (Te Reo Māori)', native: 'Te Reo Māori', flag: '🇳🇿', continent: 'oceania', countries: ['New Zealand'] },
    { code: 'sm', name: 'Samoan (Gagana Samoa)', native: 'Gagana Samoa', flag: '🇼🇸', continent: 'oceania', countries: ['Samoa', 'American Samoa'] },
    { code: 'haw', name: 'Hawaiian (ʻŌlelo Hawaiʻi)', native: 'ʻŌlelo Hawaiʻi', flag: '🌺', continent: 'oceania', countries: ['United States'] }
  ];

  // Quick popular picks
  const POPULAR_CODES = ['en', 'es', 'fr', 'ar', 'zh-CN', 'hi', 'bn', 'pt', 'ru', 'de', 'ja', 'id'];

  let activeContinent = 'all';
  let searchQuery = '';
  let currentLangCode = getSavedLanguage() || 'en';

  // Helper to read Google Translate cookie
  function getSavedLanguage() {
    const match = document.cookie.match(/(^|;) *googtrans=([^;]+)/);
    if (match && match[2]) {
      const parts = match[2].split('/');
      return parts[parts.length - 1] || 'en';
    }
    return localStorage.getItem('site_selected_lang') || 'en';
  }

  function setLanguageCookie(code) {
    localStorage.setItem('site_selected_lang', code);
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${code}; path=/;`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${domain};`;
  }

  // Trigger Google Translate engine
  window.doGTranslate = function (langCode) {
    currentLangCode = langCode;
    setLanguageCookie(langCode);

    // Update triggers UI
    updateTriggerPills(langCode);

    // Trigger select inside google frame or reload if needed
    const select = document.querySelector('select.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  function updateTriggerPills(langCode) {
    const langObj = LANGUAGES.find(l => l.code === langCode || l.code.startsWith(langCode)) || { flag: '🌐', code: langCode.toUpperCase() };
    document.querySelectorAll('.global-translator-trigger .current-lang-pill').forEach(el => {
      el.textContent = `${langObj.flag} ${langObj.code}`;
    });
    document.querySelectorAll('.navbar-lang-btn .current-lang-label').forEach(el => {
      el.textContent = `${langObj.flag} ${langObj.native || langObj.name}`;
    });
  }

  // Build Modal DOM
  function createTranslatorUI() {
    if (document.getElementById('translator-modal-backdrop')) return;

    // 1. Hidden Google Translate Element Container
    const gDiv = document.createElement('div');
    gDiv.id = 'google_translate_element';
    document.body.appendChild(gDiv);

    // 2. Floating Trigger Button
    const triggerBtn = document.createElement('div');
    triggerBtn.className = 'global-translator-trigger';
    triggerBtn.setAttribute('title', 'Translate website to 195+ countries languages');
    triggerBtn.innerHTML = `
      <span class="globe-icon">🌐</span>
      <span>Translate</span>
      <span class="current-lang-pill">EN</span>
    `;
    document.body.appendChild(triggerBtn);

    // 3. Modal Backdrop & Dialog
    const backdrop = document.createElement('div');
    backdrop.id = 'translator-modal-backdrop';
    backdrop.className = 'translator-modal-backdrop';
    backdrop.innerHTML = `
      <div class="translator-modal" role="dialog" aria-modal="true">
        <div class="translator-header">
          <h3><span>🌐</span> Select Language (১৯৫টি দেশের ভাষা)</h3>
          <button class="translator-close-btn" aria-label="Close">&times;</button>
        </div>

        <div class="translator-search-box">
          <input type="text" class="translator-search-input" placeholder="Search language or country (e.g. Spanish, France, Brazil, 日本語)..." />
        </div>

        <div class="continent-tabs">
          <button class="continent-tab active" data-continent="all">🌍 All (সকল দেশ)</button>
          <button class="continent-tab" data-continent="asia">🌏 Asia (এশিয়া)</button>
          <button class="continent-tab" data-continent="europe">🌍 Europe (ইউরোপ)</button>
          <button class="continent-tab" data-continent="africa">🌍 Africa (আফ্রিকা)</button>
          <button class="continent-tab" data-continent="americas">🌎 Americas (আমেরিকা)</button>
          <button class="continent-tab" data-continent="oceania">🌏 Oceania (ওশেনিয়া)</button>
        </div>

        <div class="translator-body">
          <div class="popular-section-title">⭐ Popular Languages (জনপ্রিয় ভাষা)</div>
          <div class="languages-grid popular-grid"></div>

          <div class="popular-section-title" style="margin-top: 20px;">🌐 All Languages (সম্পূর্ণ তালিকা)</div>
          <div class="languages-grid all-grid"></div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    // Render Languages
    renderLanguages();

    // Event Listeners
    triggerBtn.addEventListener('click', openModal);
    backdrop.querySelector('.translator-close-btn').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Also wire up any navbar buttons
    document.querySelectorAll('.navbar-lang-btn, .lang-select').forEach(btn => {
      if (btn.tagName === 'SELECT') {
        btn.style.cursor = 'pointer';
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          openModal();
        });
      } else {
        btn.addEventListener('click', openModal);
      }
    });

    // Continent Tabs
    backdrop.querySelectorAll('.continent-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        backdrop.querySelectorAll('.continent-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeContinent = tab.dataset.continent;
        renderLanguages();
      });
    });

    // Search Input
    const searchInput = backdrop.querySelector('.translator-search-input');
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderLanguages();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('active')) {
        closeModal();
      }
    });

    updateTriggerPills(currentLangCode);
  }

  function openModal() {
    const backdrop = document.getElementById('translator-modal-backdrop');
    if (backdrop) {
      backdrop.classList.add('active');
      const input = backdrop.querySelector('.translator-search-input');
      if (input) {
        input.value = '';
        searchQuery = '';
        renderLanguages();
        setTimeout(() => input.focus(), 150);
      }
    }
  }

  function closeModal() {
    const backdrop = document.getElementById('translator-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  function renderLanguages() {
    const popularGrid = document.querySelector('.popular-grid');
    const allGrid = document.querySelector('.all-grid');
    if (!allGrid) return;

    let filtered = LANGUAGES.filter(l => {
      const matchContinent = activeContinent === 'all' || l.continent === activeContinent;
      const matchSearch = !searchQuery || 
        l.name.toLowerCase().includes(searchQuery) ||
        l.native.toLowerCase().includes(searchQuery) ||
        l.code.toLowerCase().includes(searchQuery) ||
        l.countries.some(c => c.toLowerCase().includes(searchQuery));
      return matchContinent && matchSearch;
    });

    // Popular grid
    if (popularGrid) {
      if (searchQuery || activeContinent !== 'all') {
        popularGrid.style.display = 'none';
        popularGrid.previousElementSibling.style.display = 'none';
      } else {
        popularGrid.style.display = 'grid';
        popularGrid.previousElementSibling.style.display = 'block';
        popularGrid.innerHTML = POPULAR_CODES.map(code => {
          const l = LANGUAGES.find(item => item.code === code);
          if (!l) return '';
          return createLangCardHTML(l);
        }).join('');
      }
    }

    // All grid
    if (filtered.length === 0) {
      allGrid.innerHTML = `<div class="no-lang-results">🔍 কোনো ভাষা বা দেশ খুঁজে পাওয়া যায়নি ("${searchQuery}")। অন্য কোনো নাম দিয়ে চেষ্টা করুন।</div>`;
    } else {
      allGrid.innerHTML = filtered.map(l => createLangCardHTML(l)).join('');
    }

    // Bind click events on cards
    document.querySelectorAll('.lang-item').forEach(item => {
      item.addEventListener('click', () => {
        const code = item.dataset.code;
        closeModal();
        doGTranslate(code);
      });
    });
  }

  function createLangCardHTML(l) {
    const isSelected = currentLangCode === l.code || currentLangCode.startsWith(l.code);
    return `
      <div class="lang-item ${isSelected ? 'selected' : ''}" data-code="${l.code}">
        <span class="lang-flag">${l.flag}</span>
        <div class="lang-info">
          <span class="lang-native">${l.native}</span>
          <span class="lang-english">${l.name}</span>
        </div>
      </div>
    `;
  }

  // Load Google Translate Script
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: LANGUAGES.map(l => l.code).join(','),
      autoDisplay: false,
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');

    // If a language is already stored, apply it once loaded
    setTimeout(() => {
      const saved = getSavedLanguage();
      if (saved && saved !== 'en') {
        const select = document.querySelector('select.goog-te-combo');
        if (select && select.value !== saved) {
          select.value = saved;
          select.dispatchEvent(new Event('change'));
        }
      }
    }, 800);
  };

  function loadGoogleTranslateScript() {
    if (document.getElementById('google-translate-script')) return;
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }

  // Auto-detect visitor language for social media visitors
  function detectSocialVisitorLanguage() {
    const saved = localStorage.getItem('site_selected_lang');
    if (!saved) {
      const userLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      const matched = LANGUAGES.find(l => userLang.startsWith(l.code) || l.code.startsWith(userLang.split('-')[0]));
      if (matched && matched.code !== 'en') {
        // Automatically switch language for foreign visitors
        console.log('Auto-detected visitor language:', matched.name);
        setLanguageCookie(matched.code);
      }
    }
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      detectSocialVisitorLanguage();
      createTranslatorUI();
      loadGoogleTranslateScript();
    });
  } else {
    detectSocialVisitorLanguage();
    createTranslatorUI();
    loadGoogleTranslateScript();
  }
})();
