const DB_KEY = 'nexus_cms_articles';

const seedData = [
  {
    id: 'art-seed-1',
    title: 'Global Climate Emergency Summit Reaches Historic Agreement',
    category: 'World',
    excerpt: 'World leaders from 195 nations have unanimously adopted the most ambitious climate framework in history...',
    content: '<p>In a landmark moment for global diplomacy, representatives from all 195 member states of the United Nations signed the Geneva Climate Accord 2026 on Tuesday morning, marking the culmination of 14 months of intense negotiations.</p><p>The agreement sets binding targets for signatory nations with graduated timelines based on economic development status. Developed nations must achieve net-zero carbon emissions by 2038.</p><p>The $4 trillion fund — described by economists as the largest coordinated financial commitment in history — will be disbursed over 15 years, prioritizing renewable energy infrastructure.</p>',
    media: '',
    date: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'art-seed-2',
    title: 'Quantum Computing Milestone: First Error-Free 1000-Qubit Processor',
    category: 'Technology',
    excerpt: 'Scientists achieve a breakthrough in error correction, paving the way for commercial quantum computing.',
    content: '<p>Researchers have finally cracked the error-correction barrier that has held back quantum computing for decades.</p><p>By fundamentally changing how data is processed and utilized, these new frameworks promise to drastically reduce operational friction across sectors ranging from healthcare to logistics.</p>',
    media: '',
    date: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'art-seed-3',
    title: 'Championship Final: Underdog Nation Stuns Favorites in Penalty Shootout Drama',
    category: 'Sports',
    excerpt: 'A historic night in the world of sports as the underdog team secures their first international trophy.',
    content: '<p>The stadium erupted as the final penalty found the back of the net, marking the end of a dramatic 120-minute standoff.</p><p>Fans took to the streets in unprecedented numbers to celebrate a victory that many analysts previously deemed mathematically impossible.</p>',
    media: '',
    date: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'art-seed-4',
    title: 'Central Bank Slashes Rates to Lowest in 15 Years, Markets Surge',
    category: 'Business',
    excerpt: 'The unexpected 75-basis-point cut sent equity markets to all-time highs as investors recalibrated growth forecasts.',
    content: '<p>Global equity markets experienced a historic rally this morning following the aggressive monetary easing.</p><p>Economists warn that while overall output is projected to skyrocket, the labor market must adapt at an unprecedented pace.</p>',
    media: '',
    date: new Date(Date.now() - 14400000).toISOString()
  }
];

function initDB() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(seedData));
  }
}

function getArticles() {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function addArticle(article) {
  const articles = getArticles();
  articles.unshift(article); // Add to the beginning (most recent first)
  localStorage.setItem(DB_KEY, JSON.stringify(articles));
}

function getArticleById(id) {
  return getArticles().find(a => a.id === id);
}

function updateArticle(id, updatedData) {
  let articles = getArticles();
  articles = articles.map(a => a.id === id ? { ...a, ...updatedData } : a);
  localStorage.setItem(DB_KEY, JSON.stringify(articles));
}

function deleteArticle(id) {
  let articles = getArticles();
  articles = articles.filter(a => a.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(articles));
}
