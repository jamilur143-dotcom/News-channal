// GitHub update trigger
const DB_KEY = 'nexus_cms_articles';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsFepvv7MuyCPWs4v-qTSIMnBCb3Xqbc0",
  authDomain: "display-adds-ee8f3.firebaseapp.com",
  projectId: "display-adds-ee8f3",
  storageBucket: "display-adds-ee8f3.firebasestorage.app",
  messagingSenderId: "648789918792",
  appId: "1:648789918792:web:0e54a6e94357c46e68447d",
  measurementId: "G-HPBBM8KTSB"
};

// Initialize Firebase
let db = null;
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("Firebase Firestore connected successfully.");
  }
} catch (err) {
  console.warn("Firebase initialization error:", err);
}

const seedData = [
  {
    id: 'art-seed-1',
    title: 'Global Climate Emergency Summit Reaches Historic Agreement',
    category: 'World',
    excerpt: 'World leaders from 195 nations have unanimously adopted the most ambitious climate framework in history...',
    content: '<p>In a landmark moment for global diplomacy, representatives from all 195 member states of the United Nations signed the Geneva Climate Accord 2026 on Tuesday morning, marking the culmination of 14 months of intense negotiations.</p><p>The agreement sets binding targets for signatory nations with graduated timelines based on economic development status. Developed nations must achieve net-zero carbon emissions by 2038.</p><p>The $4 trillion fund â€” described by economists as the largest coordinated financial commitment in history â€” will be disbursed over 15 years, prioritizing renewable energy infrastructure.</p>',
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

function getFirestoreDb() {
  if (db) return db;
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      return db;
    }
  } catch (err) {
    console.warn("Firebase initialization retry error:", err);
  }
  return null;
}

// Local Synchronous Fallbacks
function getArticles() {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function getArticleById(id) {
  return getArticles().find(a => a.id === id);
}

// Firestore Async Functions (Global Cloud Storage)
async function getArticlesAsync() {
  const firestore = getFirestoreDb();
  if (firestore) {
    try {
      let snapshot = null;
      try {
        snapshot = await firestore.collection('nexus_articles').orderBy('date', 'desc').get();
      } catch (orderErr) {
        snapshot = await firestore.collection('nexus_articles').get();
      }
      if (snapshot && !snapshot.empty) {
        const articles = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data && (data.title || data.id)) articles.push(data);
        });
        if (articles.length > 0) {
          // Sort by date if available
          articles.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          localStorage.setItem(DB_KEY, JSON.stringify(articles));
          return articles;
        }
      }
    } catch (e) {
      console.warn("Firestore fetch error, using local fallback:", e);
    }
  }
  return getArticles();
}

async function getArticleByIdAsync(id) {
  const firestore = getFirestoreDb();
  if (firestore && id) {
    try {
      const doc = await firestore.collection('nexus_articles').doc(id).get();
      if (doc.exists) {
        const article = doc.data();
        // Update local cache
        const localArticles = getArticles().filter(a => a.id !== id);
        localArticles.unshift(article);
        localStorage.setItem(DB_KEY, JSON.stringify(localArticles));
        return article;
      }
    } catch (e) {
      console.warn("Firestore get error, using local fallback:", e);
    }
  }
  return getArticleById(id);
}

async function addArticle(article) {
  // 1. Save to Local Cache first
  const articles = getArticles().filter(a => a.id !== article.id);
  articles.unshift(article);
  localStorage.setItem(DB_KEY, JSON.stringify(articles));

  // 2. Save to Firestore Cloud Database
  const firestore = getFirestoreDb();
  if (firestore && article.id) {
    try {
      await firestore.collection('nexus_articles').doc(article.id).set(article);
      console.log("Article saved to Firestore cloud successfully:", article.id);
      return true;
    } catch (e) {
      console.error("Failed to save article to Firestore:", e);
      throw e;
    }
  } else {
    throw new Error("Firebase Firestore could not be initialized.");
  }
}

async function updateArticle(id, updatedData) {
  let articles = getArticles();
  articles = articles.map(a => a.id === id ? { ...a, ...updatedData } : a);
  localStorage.setItem(DB_KEY, JSON.stringify(articles));

  const firestore = getFirestoreDb();
  if (firestore && id) {
    try {
      await firestore.collection('nexus_articles').doc(id).set(updatedData, { merge: true });
      console.log("Article updated in Firestore:", id);
      return true;
    } catch (e) {
      console.error("Failed to update article in Firestore:", e);
      throw e;
    }
  } else {
    throw new Error("Firebase Firestore could not be initialized.");
  }
}

async function deleteArticle(id) {
  let articles = getArticles();
  articles = articles.filter(a => a.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(articles));

  const firestore = getFirestoreDb();
  if (firestore && id) {
    try {
      await firestore.collection('nexus_articles').doc(id).delete();
      console.log("Article deleted from Firestore:", id);
      return true;
    } catch (e) {
      console.error("Failed to delete article from Firestore:", e);
      throw e;
    }
  }
}

// Global Cloud Ad Settings (Synced across all users and browsers)
async function getAdSettingsAsync() {
  const firestore = typeof getFirestoreDb === 'function' ? getFirestoreDb() : null;
  const defaultConfig = { social: '', popunder: '', b728: '', b160: '', b300: '', native: '', smartlink: '' };
  
  if (firestore) {
    try {
      const doc = await firestore.collection('nexus_settings').doc('ad_config').get();
      if (doc.exists) {
        const data = doc.data();
        Object.keys(defaultConfig).forEach(k => {
            if(data[k] !== undefined) localStorage.setItem('ad_'+k, data[k]);
        });
        return { ...defaultConfig, ...data };
      }
    } catch (e) { console.warn("Firestore ad fetch error:", e); }
  }
  
  Object.keys(defaultConfig).forEach(k => { defaultConfig[k] = localStorage.getItem('ad_'+k) || ''; });
  return defaultConfig;
}

async function saveAdSettingsAsync(configObj) {
  Object.keys(configObj).forEach(k => localStorage.setItem('ad_'+k, configObj[k]));
  const firestore = typeof getFirestoreDb === 'function' ? getFirestoreDb() : null;
  if (firestore) {
    try {
      configObj.updatedAt = new Date().toISOString();
      await firestore.collection('nexus_settings').doc('ad_config').set(configObj);
      return true;
    } catch (e) { throw e; }
  }
  return false;
}




