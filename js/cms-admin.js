// --- GLOBAL HELPERS: URL RESOLUTION & SHORTENER ---
function getArticleLandingUrl(articleId) {
    const origin = window.location.origin;
    let path = window.location.pathname;
    path = path.replace(/\/admin(\/index\.html|\/)?$/i, '');
    if (path.endsWith('/index.html')) path = path.replace(/\/index\.html$/i, '');
    const cleanLanding = (origin + (path ? path : '') + '/landing.html').replace(/([^:])\/\//g, '$1/');
    return `${cleanLanding}?id=${articleId}`;
}

async function generateShortUrl(longUrl) {
    try {
        const formData = new URLSearchParams();
        formData.append('url', longUrl);
        const res = await fetch('https://spoo.me/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            body: formData.toString()
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.short_url) return data.short_url.replace('http://', 'https://');
        }
    } catch (e) {
        console.warn("Spoo.me shortener failed, falling back to direct URL:", e);
    }
    return longUrl;
}

// --- CLOUDINARY CONFIGURATION & UPLOAD HELPER ---
const CLOUDINARY_CLOUD_NAME = 'xlzab0vf';
const CLOUDINARY_UPLOAD_PRESET = 'l1wscesh';

window.uploadToCloudinaryGlobal = async function(file) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Cloudinary upload failed');
    }
    const data = await response.json();
    return data.secure_url;
}

// --- MAIN BUILDER LOGIC ---
document.addEventListener('DOMContentLoaded', async () => {
    let activeBlock = null;
    const dropzone = document.getElementById('dropzone');
    const defaultTitle = document.getElementById('default-title');
    const defaultContent = document.getElementById('default-content');
    const defaultHero = document.getElementById('default-hero');
    
    // 1. TEMPLATE SWITCHER
    const tplSelect = document.getElementById('template-selector');
    if (tplSelect) {
        tplSelect.addEventListener('change', (e) => {
            const canvas = document.getElementById('main-canvas');
            canvas.className = 'visual-canvas'; 
            if(e.target.value !== 'template1') {
                canvas.classList.add(e.target.value.replace('template', 'template-'));
            }
        });
    }

    // 2. HERO IMAGE LOGIC
    document.addEventListener('click', (e) => {
        const hero = e.target.closest('#default-hero');
        if (hero && !e.target.closest('#default-title, .meta-data, #default-content')) {
            document.getElementById('default-hero-input')?.click();
        }
    });

    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'default-hero-input') {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    const img = document.getElementById('default-hero-img');
                    if(img) { img.src = ev.target.result; img.style.display = 'block'; }
                    document.getElementById('default-hero-ph')?.style.setProperty('display', 'none');
                    document.getElementById('default-hero-overlay')?.style.setProperty('display', 'none');
                    try {
                        const cdnUrl = await window.uploadToCloudinaryGlobal(file);
                        if(img) img.src = cdnUrl;
                    } catch (err) { alert('Upload Failed: ' + err.message); }
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // 3. DRAG AND DROP ENGINE
    document.querySelectorAll('.tool-item').forEach(tool => {
        tool.addEventListener('dragstart', (e) => e.dataTransfer.setData('type', tool.dataset.type));
    });

    if(dropzone) {
        let lastTarget = null;
        const canvas = document.getElementById('main-canvas');
        canvas.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            const target = e.target.closest('.inner-dropzone') || dropzone; 
            if(target !== lastTarget) { 
                if(lastTarget) lastTarget.classList.remove('drag-hover');
                if(target) target.classList.add('drag-hover'); 
                lastTarget = target;
            } 
        });
        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            document.querySelectorAll('.drag-hover').forEach(el => el.classList.remove('drag-hover'));
            const type = e.dataTransfer.getData('type');
            if(!type) return;

            let targetDropzone = e.target.closest('.inner-dropzone') || dropzone;
            if(targetDropzone && ['p', 'img', 'vid'].includes(type)) {
                let block = document.createElement('div');
                block.className = 'canvas-block';
                block.dataset.type = type;

                let inner = '';
                if(type === 'p') inner = '<div contenteditable="true" class="edit-text edit-p" data-type="text" placeholder="Start typing new paragraph..."></div>';
                if(type === 'img') inner = '<div class="img-ph" onclick="this.parentElement.querySelector(\'.hidden-file-input\').click();" style="display:flex; justify-content:center; align-items:center; cursor:pointer; height:250px; background:#f1f5f9;">[img] Click to upload</div><img src="" onclick="this.parentElement.querySelector(\'.hidden-file-input\').click();" style="display:none; width:100%; object-fit:cover; border-radius:4px;" /><input type="file" class="hidden-file-input" accept="image/*" style="display:none;">';
                if(type === 'vid') inner = '<div class="vid-ph">&#9654; Set YouTube URL</div><iframe src="" style="display:none; width:100%; aspect-ratio:16/9; border:none;" allowfullscreen></iframe>';
                
                block.innerHTML = `<button type="button" class="block-del" onclick="this.closest('.canvas-block').remove();">&times;</button>${inner}`;
                targetDropzone.appendChild(block);
                window.bindBlock(block);
            }
        });
    }

    // 4. BLOCK BINDING
    window.bindBlock = function(block) {
        ['click', 'focusin'].forEach(evt => {
            block.addEventListener(evt, (e) => {
                e.stopPropagation();
                document.querySelectorAll('.canvas-block, .edit-text').forEach(b => b.classList.remove('active'));
                block.classList.add('active');
                activeBlock = block;
            });
        });
    };

    ['click', 'focusin'].forEach(evt => {
        document.addEventListener(evt, (e) => {
            const target = e.target.closest('#default-title, #default-content, .meta-data .edit-text');
            if (target) {
                e.stopPropagation();
                document.querySelectorAll('.canvas-block, .edit-text').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                activeBlock = target;
            }
        });
    });

    document.body.addEventListener('mousedown', (e) => {
        if(e.target.closest('.form-panel') || e.target.closest('.publish-card') || e.target.closest('.visual-canvas')) return;
        document.querySelectorAll('.canvas-block, .edit-text').forEach(b => b.classList.remove('active'));
        activeBlock = null;
    });

    // 5. PUBLISH LOGIC
    const publishBtn = document.getElementById('top-publish-btn');
    if(publishBtn) {
        publishBtn.addEventListener('click', async () => {
            try {
                publishBtn.disabled = true;
                publishBtn.textContent = 'Publishing...';

                const title = defaultTitle ? defaultTitle.textContent.trim() : '';
                if(!title || title === 'Type your main headline here...') { 
                    alert("Please type a main headline before publishing!"); 
                    publishBtn.disabled = false;
                    publishBtn.textContent = 'Publish Live';
                    return; 
                }

                const catSelect = document.getElementById('news-cat');
                const category = catSelect ? catSelect.options[catSelect.selectedIndex].text : 'News';
                const excerpt = document.getElementById('news-excerpt') ? document.getElementById('news-excerpt').value.trim() : '';
                const imgNode = document.getElementById('default-hero-img');
                const media = (imgNode && imgNode.style.display !== 'none') ? imgNode.src : '';

                let finalContent = '';
                if(defaultContent) finalContent += `<div class="article-text">${defaultContent.innerHTML}</div>`;
                
                if(dropzone) {
                    const clone = dropzone.cloneNode(true);
                    clone.querySelectorAll('.canvas-block').forEach(el => {
                        const type = el.dataset.type;
                        if(type === 'p') {
                            const txt = el.querySelector('div[data-type="text"]');
                            if(txt) finalContent += `<div class="article-text">${txt.innerHTML}</div>`;
                        } else if(type === 'img') {
                            const img = el.querySelector('img');
                            if(img && img.style.display !== 'none') finalContent += `<figure class="article-media"><img src="${img.src}" style="width:100%; border-radius:4px;"/></figure>`;
                        }
                    });
                }
                
                const canvasClone = document.getElementById('main-canvas').cloneNode(true);
                canvasClone.querySelectorAll('.remove-ad, .block-del, .drop-hint, .hidden-file-input').forEach(el => el.remove());
                canvasClone.querySelectorAll('[contenteditable]').forEach(el => {
                    el.removeAttribute('contenteditable');
                    el.classList.remove('edit-text', 'active');
                });

                const isEditing = document.getElementById('main-canvas').dataset.editId;
                const statusEl = document.getElementById('article-status');

                const article = {
                    id: isEditing || 'art-' + Date.now(),
                    template: document.getElementById('template-selector')?.value || 'template1',
                    title, excerpt, category, content: finalContent, media,
                    fullHTML: canvasClone.outerHTML,
                    adminHTML: document.getElementById('main-canvas').innerHTML,
                    status: statusEl ? statusEl.value : 'Published',
                    date: new Date().toISOString()
                };

                if (isEditing) await updateArticle(article.id, article);
                else await addArticle(article);
                
                publishBtn.disabled = false;
                publishBtn.textContent = 'âœ“ Published Live';

                if (typeof window.renderManageArticles === 'function') await window.renderManageArticles();

                const successCard = document.getElementById('publish-success-card');
                if(successCard) {
                    successCard.style.background = '#f0fdf4';
                    successCard.style.border = '1px solid #bbf7d0';
                    document.getElementById('publish-status-text').innerHTML = '&#10003; Published Successfully!';
                    const viewBtn = document.getElementById('view-live-btn');
                    if(viewBtn) {
                        viewBtn.style.display = 'block';
                        viewBtn.href = getArticleLandingUrl(article.id);
                    }
                }
                setTimeout(() => { publishBtn.textContent = 'Publish Live'; }, 3000);
            } catch (err) {
                console.error(err);
                publishBtn.disabled = false;
                publishBtn.textContent = 'Publish Failed';
                alert('Publish Failed: ' + (err.message || 'Unknown Error'));
            }
        });
    }
});

// --- MANAGE ARTICLES SYSTEM ---
document.addEventListener('DOMContentLoaded', () => {
    const btnManage = document.getElementById('btn-manage-articles');
    const modalManage = document.getElementById('manage-articles-modal');
    const btnCloseManage = document.getElementById('manage-modal-close');
    const manageBody = document.getElementById('manage-modal-body');

    if(btnManage && modalManage) {
        btnManage.addEventListener('click', async () => {
            modalManage.style.display = 'flex';
            if (manageBody) manageBody.innerHTML = '<div style="text-align:center; padding: 40px;"><h3>Loading articles...</h3></div>';
            await window.renderManageArticles();
        });
        btnCloseManage.addEventListener('click', () => modalManage.style.display = 'none');
        modalManage.addEventListener('click', (e) => { if(e.target === modalManage) modalManage.style.display = 'none'; });
    }

    window.renderManageArticles = async function() {
        if(!manageBody) return;
        let articles = [];
        try { articles = await getArticlesAsync(); } 
        catch (err) { articles = typeof getArticles === 'function' ? getArticles() : []; }

        if(!articles || articles.length === 0) {
            manageBody.innerHTML = '<div style="text-align:center; padding: 40px;"><h3>No articles published yet.</h3></div>';
            return;
        }

        let html = '<div class="article-grid">';
        articles.forEach(art => {
            if (!art) return;
            const dateStr = art.date ? new Date(art.date).toLocaleDateString() : 'Recent';
            let imgHtml = art.media ? `<img src="${art.media}" class="m-card-img" />` : `<div class="m-card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;">ðŸ“°</div>`;
            const fullArticleUrl = getArticleLandingUrl(art.id || 'seed-1');

            html += `
                <div class="m-card" data-id="${art.id}">
                    <span class="m-status-badge">${art.status || 'Published'}</span>
                    ${imgHtml}
                    <div class="m-card-body">
                        <div class="m-card-cat">${art.category || 'News'}</div>
                        <h3 class="m-card-title">${art.title || 'Untitled Article'}</h3>
                        <div class="m-card-date">ðŸ•’ ${dateStr}</div>
                        <div class="m-card-actions">
                            <a href="${fullArticleUrl}" target="_blank" class="m-btn m-btn-view">👁️ View</a>
                            <button class="m-btn m-btn-short" onclick="copyArticleShortLink('${fullArticleUrl}', this)">🔗 Short</button>
                            <button class="m-btn m-btn-edit" onclick="editArticle('${art.id}')">✏️ Edit</button>
                            <button class="m-btn m-btn-delete" onclick="removeArticle('${art.id}')">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        manageBody.innerHTML = html;
    };

    window.removeArticle = async function(id) {
        if(confirm('Are you sure you want to delete this article?')) {
            if (typeof deleteArticle === 'function') await deleteArticle(id);
            await window.renderManageArticles(); 
        }
    };

    window.copyArticleShortLink = async function(longUrl, btn) {
        const origText = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;
        try {
            const shortUrl = await generateShortUrl(longUrl);
            await navigator.clipboard.writeText(shortUrl);
            btn.textContent = '✓ Copied!';
        } catch (e) {
            prompt('Copy your short link:', longUrl);
            btn.textContent = '🔗 Short';
        }
        btn.disabled = false;
        setTimeout(() => { btn.textContent = origText; }, 2000);
    };

    window.editArticle = function(id) {
        let articles = [];
        try { articles = typeof getArticles === 'function' ? getArticles() : []; } catch(e) {}
        const art = articles.find(a => a.id === id);
        if(!art) return;
        
        const canvas = document.getElementById('main-canvas');
        if(!canvas) return;
        
        canvas.dataset.editId = id;
        
        if (art.adminHTML) {
            canvas.innerHTML = art.adminHTML;
            canvas.querySelectorAll('.canvas-block').forEach(block => {
                if (typeof window.bindBlock === 'function') window.bindBlock(block);
            });
        } else if (art.fullHTML) {
            canvas.innerHTML = art.fullHTML;
            canvas.querySelectorAll('.article-text, h1, h2, span').forEach(el => {
                if(!el.closest('.meta-data')) {
                    el.setAttribute('contenteditable', 'true');
                    el.classList.add('edit-text');
                }
            });
        }

        const statusEl = document.getElementById('article-status');
        if (statusEl && art.status) statusEl.value = art.status;

        const catSelect = document.getElementById('news-cat');
        if(catSelect && art.category) {
            for(let i=0; i<catSelect.options.length; i++) {
                if(catSelect.options[i].text === art.category) {
                    catSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        const tplSelect = document.getElementById('template-selector');
        if (tplSelect && art.template) tplSelect.value = art.template;

        const modalManage = document.getElementById('manage-articles-modal');
        if(modalManage) modalManage.style.display = 'none';
        
        alert('Article loaded into editor! Make your changes and click "Publish Live" to update.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
});

// --- HANDLE BLOCK IMAGE UPLOADS ---
document.addEventListener('change', async (e) => {
    if (e.target && e.target.classList.contains('hidden-file-input')) {
        const file = e.target.files[0];
        if (file) {
            const block = e.target.closest('.canvas-block');
            if (block) {
                const imgEl = block.querySelector('img');
                const ph = block.querySelector('.img-ph');
                if (imgEl) { imgEl.src = URL.createObjectURL(file); imgEl.style.display = 'block'; }
                if (ph) ph.style.display = 'none';
                try {
                    const cdnUrl = await window.uploadToCloudinaryGlobal(file);
                    if (imgEl) imgEl.src = cdnUrl;
                } catch (err) { alert('Upload Failed: ' + err.message); }
            }
        }
    }
});




// --- TOP-BAR MODAL CONTROLS (Meta Data & Ad Settings) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Ad Settings Modal UI Controls
    const btnAdSettings = document.getElementById('btn-open-ad-settings');
    const modalAdSettings = document.getElementById('ad-settings-modal');
    const btnCloseAdSettings = document.getElementById('ad-settings-modal-close');
    
    if (btnAdSettings && modalAdSettings) {
        btnAdSettings.addEventListener('click', () => modalAdSettings.style.display = 'flex');
        btnCloseAdSettings.addEventListener('click', () => modalAdSettings.style.display = 'none');
        modalAdSettings.addEventListener('click', (e) => {
            if (e.target === modalAdSettings) modalAdSettings.style.display = 'none';
        });
    }

    // --- AD SETTINGS LOGIC (Cloud Synced) ---
    const adIds = ['social', 'popunder', '728', '160', '300', 'native', 'smartlink'];
    const saveAdsBtn = document.getElementById('btn-save-ads');

    if (saveAdsBtn) {
        if(typeof getAdSettingsAsync === 'function') {
            getAdSettingsAsync().then(config => {
                adIds.forEach(id => {
                    const el = document.getElementById('ad-' + id);
                    if (el) el.value = config[id] || '';
                });
            });
        }

        saveAdsBtn.addEventListener('click', async () => {
            saveAdsBtn.disabled = true;
            saveAdsBtn.textContent = 'Saving...';
            
            const configObj = {};
            adIds.forEach(id => {
                const el = document.getElementById('ad-' + id);
                configObj[id] = el ? el.value.trim() : '';
            });

            try {
                if(typeof saveAdSettingsAsync === 'function') {
                    await saveAdSettingsAsync(configObj);
                }
                alert('Ad settings saved globally to Cloud successfully!');
            } catch (e) {
                alert('Saved locally. (Cloud Sync Notice: ' + e.message + ')');
            } finally {
                saveAdsBtn.disabled = false;
                saveAdsBtn.textContent = '💾 Save Ad Settings';
                const modal = document.getElementById('ad-settings-modal');
                if(modal) modal.style.display = 'none';
            }
        });
    }

    // 2. Meta Data Modal
    const btnMetaData = document.getElementById('btn-open-meta-data');
    const modalMetaData = document.getElementById('meta-data-modal');
    const btnCloseMetaData = document.getElementById('meta-data-modal-close');
    
    if (btnMetaData && modalMetaData) {
        btnMetaData.addEventListener('click', () => modalMetaData.style.display = 'flex');
        btnCloseMetaData.addEventListener('click', () => modalMetaData.style.display = 'none');
        modalMetaData.addEventListener('click', (e) => {
            if (e.target === modalMetaData) modalMetaData.style.display = 'none';
        });
        
        // Auto-close when clicking save
        const saveMetaBtn = document.getElementById('btn-save-meta');
        if (saveMetaBtn) {
            saveMetaBtn.addEventListener('click', () => modalMetaData.style.display = 'none');
        }
    }
});


// --- SIDEBAR CONTROLS (Create New & Analytics Dashboard) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Create New Article Logic
    const btnNew = document.getElementById('btn-new-article');
    if (btnNew) {
        btnNew.addEventListener('click', () => {
            if (confirm('Create a new blank article? Unsaved changes in the current editor will be cleared.')) {
                // Reload without query parameters to ensure a blank slate
                window.location.href = window.location.pathname;
            }
        });
    }

    // 2. Analytics Dashboard Logic
    const btnAnalytics = document.getElementById('btn-analytics-dashboard');
    const modalAnalytics = document.getElementById('analytics-dashboard-modal');
    const btnCloseAnalytics = document.getElementById('analytics-modal-close');
    let trafficChartInstance = null;

    if (btnAnalytics && modalAnalytics) {
        btnAnalytics.addEventListener('click', () => {
            renderAnalytics();
            modalAnalytics.style.display = 'flex';
        });

        btnCloseAnalytics.addEventListener('click', () => {
            modalAnalytics.style.display = 'none';
        });

        modalAnalytics.addEventListener('click', (e) => {
            if(e.target === modalAnalytics) {
                modalAnalytics.style.display = 'none';
            }
        });

        function renderAnalytics() {
            const logs = JSON.parse(localStorage.getItem('siteTrafficLogs') || '[]');
            
            // Calculate Stats
            const totalViews = logs.length;
            const totalViewsEl = document.getElementById('a-total-views');
            if(totalViewsEl) totalViewsEl.textContent = totalViews;

            const todayStr = new Date().toISOString().split('T')[0];
            const todayViews = logs.filter(l => l.date === todayStr).length;
            const todayViewsEl = document.getElementById('a-today-views');
            if(todayViewsEl) todayViewsEl.textContent = todayViews;

            const pageCounts = {};
            logs.forEach(l => {
                pageCounts[l.page] = (pageCounts[l.page] || 0) + 1;
            });
            
            let topPage = '-';
            let maxCount = 0;
            for (const [page, count] of Object.entries(pageCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    topPage = page;
                }
            }
            const topPageEl = document.getElementById('a-top-page');
            if(topPageEl) topPageEl.textContent = topPage;

            // Populate Table
            const tbody = document.getElementById('a-traffic-log');
            if (tbody) {
                const recentLogs = [...logs].reverse().slice(0, 10);
                if (recentLogs.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No traffic data recorded yet.</td></tr>';
                } else {
                    tbody.innerHTML = recentLogs.map(l => `
                        <tr>
                            <td>${l.date}</td>
                            <td>${l.time}</td>
                            <td style="font-weight:600; color:#3f51b5;">${l.page}</td>
                            <td style="font-size:0.8rem; color:#64748b;">${l.path}</td>
                        </tr>
                    `).join('');
                }
            }

            // Render Chart.js
            const ctx = document.getElementById('trafficChart');
            if (ctx && typeof Chart !== 'undefined') {
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    last7Days.push(d.toISOString().split('T')[0]);
                }

                const chartData = last7Days.map(date => {
                    return logs.filter(l => l.date === date).length;
                });

                if (trafficChartInstance) {
                    trafficChartInstance.destroy();
                }

                trafficChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: last7Days,
                        datasets: [{
                            label: 'Daily Page Views',
                            data: chartData,
                            borderColor: '#3f51b5',
                            backgroundColor: 'rgba(63, 81, 181, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#3f51b5',
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1 } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }
        }
    }
});


