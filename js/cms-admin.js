// --- GLOBAL HELPERS: URL RESOLUTION & SHORTENER ---
function getArticleLandingUrl(articleId) {
    const origin = window.location.origin;
    let path = window.location.pathname;
    path = path.replace(/\/admin(\/index\.html|\/)?$/i, '');
    if (path.endsWith('/index.html')) {
        path = path.replace(/\/index\.html$/i, '');
    }
    const cleanLanding = (origin + (path ? path : '') + '/landing.html').replace(/([^:])\/\//g, '$1/');
    return `${cleanLanding}?id=${articleId}`;
}

async function generateShortUrl(longUrl) {
    // 1. Spoo.me (Instant Direct 0-Second Redirection, Zero Ads, Zero Countdown)
    try {
        const formData = new URLSearchParams();
        formData.append('url', longUrl);

        const res = await fetch('https://spoo.me/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: formData.toString()
        });

        if (res.ok) {
            const data = await res.json();
            if (data && data.short_url) {
                return data.short_url.replace('http://', 'https://');
            }
        }
    } catch (e) {
        console.warn("Spoo.me shortener failed, falling back to direct URL:", e);
    }

    return longUrl;
}

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- AD SETTINGS LOGIC (Cloud Synced) ---
    const adBannerInput = document.getElementById('global-ad-banner');
    const adScriptInput = document.getElementById('global-ad-script');
    const saveAdsBtn = document.getElementById('btn-save-ads');

    if (adBannerInput && adScriptInput && saveAdsBtn) {
        // Load initial from local then sync with Cloud Firestore
        adBannerInput.value = localStorage.getItem('adBannerCode') || '';
        adScriptInput.value = localStorage.getItem('adPopunderCode') || '';
        
        getAdSettingsAsync().then(config => {
            if (config.bannerCode) adBannerInput.value = config.bannerCode;
            if (config.popunderCode) adScriptInput.value = config.popunderCode;
        });

        saveAdsBtn.addEventListener('click', async () => {
            saveAdsBtn.disabled = true;
            saveAdsBtn.textContent = 'Saving to Cloud...';
            try {
                await saveAdSettingsAsync(adBannerInput.value, adScriptInput.value);
                saveAdsBtn.disabled = false;
                saveAdsBtn.textContent = 'Save Changes';
                alert('Ad settings saved globally to Cloud successfully! Ads will now show for all visitors worldwide.');
            } catch (e) {
                saveAdsBtn.disabled = false;
                saveAdsBtn.textContent = 'Save Changes';
                alert('Saved locally. (Cloud Sync Notice: ' + e.message + ')');
            }
        });
    }

    // Canvas & Dropzone
    const dropzone = document.getElementById('dropzone');
    
    // Dynamic Panels
    const panels = {
        'meta': document.getElementById('panel-meta'),
        'text': document.getElementById('panel-text'),
        'vid': document.getElementById('panel-vid')
    };
    
    // Default Template Nodes
    const defaultTitle = document.getElementById('default-title');
    const defaultContent = document.getElementById('default-content');
    const defaultHero = document.getElementById('default-hero');
    const defaultHeroInput = document.getElementById('default-hero-input');
    const defaultHeroImg = document.getElementById('default-hero-img');
    const defaultHeroPh = document.getElementById('default-hero-ph');
    const defaultHeroOverlay = document.getElementById('default-hero-overlay');
    const defaultHeroCaption = document.getElementById('default-hero-caption');
    const metaContainer = document.querySelector('.meta-data');
    const articleContainer = document.querySelector('.article-container');
    
    let activeBlock = null;

    // --- 0. TEMPLATE SWITCHER ---
    const templateImageSizes = {
        'template1': '1200 x 630 px (16:9)',
        'template2': '1100 x 600 px (16:9)',
        'template3': '1100 x 550 px (2:1)',
        'template4': '900 x 500 px (16:9)',
        'template5': '1400 x 700 px (Large Banner)',
        'template6': '1200 x 650 px (Hero Cover)',
        'template7': '1000 x 500 px (2:1)',
        'template8': '600 x 700 px (Portrait / Side)',
        'template9': '400 x 480 px (Author Portrait)'
    };

    function updateHeroSizeHint(tpl) {
        const size = templateImageSizes[tpl] || '1200 x 630 px';
        const badge = document.getElementById('hero-size-badge');
        if(badge) badge.textContent = `Recommended: ${size}`;
        const overlaySize = document.getElementById('hero-overlay-size');
        if(overlaySize) overlaySize.textContent = `(${size})`;
    }

    const tplSelect = document.getElementById('template-selector');
    if(tplSelect) {
        updateHeroSizeHint(tplSelect.value);
    }
    if (tplSelect) {
        tplSelect.addEventListener('change', (e) => {
            const canvas = document.getElementById('main-canvas');
            
            // 1) RESET FIRST: Move elements back to their standard (Template 1) container order
            canvas.classList.remove('template-2', 'template-3', 'template-4', 'template-5', 'template-6', 'template-7', 'template-8', 'template-9');
            
            if(articleContainer && defaultTitle && metaContainer && defaultContent) {
                // Ensure they are inside article-container 
                articleContainer.prepend(defaultContent);
                articleContainer.prepend(metaContainer);
                articleContainer.prepend(defaultTitle);
                if(dropzone) articleContainer.appendChild(dropzone);
                // Standard T1 Order: Title -> Meta -> Content
                defaultTitle.after(metaContainer); 
                metaContainer.after(defaultContent);
            }
            if(defaultHero) {
                const topAd = document.getElementById('ad-top');
                if(topAd) topAd.after(defaultHero); // Hero at the top
                else canvas.insertBefore(defaultHero, canvas.firstChild);
                if(defaultHeroCaption) defaultHero.after(defaultHeroCaption);
            }

            // Cleanup any temporary wrapper from T8 & T9
            const oldT8Split = document.getElementById('t8-split-wrap');
            if(oldT8Split) oldT8Split.remove();
            const oldT9Header = document.getElementById('t9-header-banner');
            if(oldT9Header) oldT9Header.remove();
            const oldT9Grid = document.getElementById('t9-content-grid');
            if(oldT9Grid) oldT9Grid.remove();

            // 2) APPLY NEW TEMPLATE LAYOUT
            const val = e.target.value;
            updateHeroSizeHint(val);
            if (val === 'template2') {
                // Template 2: Title -> Meta -> Hero -> Content
                canvas.classList.add('template-2');
                if(metaContainer && defaultHero) {
                    metaContainer.after(defaultHero);
                    if(defaultHeroCaption) defaultHero.after(defaultHeroCaption);
                }
            } else if (val === 'template3') {
                // Template 3: Meta -> Title -> Intro Paragraph -> Hero -> Rest
                canvas.classList.add('template-3');
                if(defaultTitle && metaContainer) defaultTitle.before(metaContainer);
                if(defaultContent && defaultHero) {
                    defaultContent.after(defaultHero);
                    if(defaultHeroCaption) defaultHero.after(defaultHeroCaption);
                }
            } else if (val === 'template4') {
                // Template 4 (Magazine): Title -> Intro Content -> Hero -> Meta Grid -> Rest
                canvas.classList.add('template-4');
                if(defaultContent && defaultHero) {
                    defaultContent.after(defaultHero); 
                    if(defaultHeroCaption) defaultHero.after(defaultHeroCaption);
                }
                if(defaultHero && metaContainer) {
                    if(defaultHeroCaption) defaultHeroCaption.after(metaContainer);
                    else defaultHero.after(metaContainer);
                }
            } else if (val === 'template5') {
                // Template 5 (Immersive): Title & Meta go INSIDE the Hero banner.
                canvas.classList.add('template-5');
                if(defaultHero && defaultTitle && metaContainer) {
                    defaultHero.appendChild(defaultTitle);
                    defaultHero.appendChild(metaContainer);
                }
            } else if (val === 'template6') {
                // Template 6 (Sidebar): Meta, Title, and Intro Content go INSIDE the Hero banner.
                canvas.classList.add('template-6');
                if(defaultHero) {
                    if(metaContainer) defaultHero.appendChild(metaContainer);
                    if(defaultTitle) defaultHero.appendChild(defaultTitle);
                    if(defaultContent) defaultHero.appendChild(defaultContent);
                }
            } else if (val === 'template7') {
                // Template 7 (Floating Box): Hero (Top) -> Meta -> Title -> Content
                canvas.classList.add('template-7');
                if(defaultTitle && metaContainer) {
                    defaultTitle.before(metaContainer); // Move Meta ABOVE Title
                }
            } else if (val === 'template8') {
                // Template 8 (Side-by-Side Split Cover)
                canvas.classList.add('template-8');
                
                const splitWrap = document.createElement('div');
                splitWrap.id = 't8-split-wrap';
                splitWrap.className = 't8-hero-split';
                
                const textWrap = document.createElement('div');
                textWrap.className = 't8-text-col';
                
                const imgWrap = document.createElement('div');
                imgWrap.className = 't8-img-col';
        
                if(articleContainer && defaultHero && defaultTitle) {
                    articleContainer.prepend(splitWrap);
                    splitWrap.appendChild(textWrap);
                    splitWrap.appendChild(imgWrap);
                    
                    textWrap.appendChild(metaContainer);
                    textWrap.appendChild(defaultTitle);
                    textWrap.appendChild(defaultContent);
                    imgWrap.appendChild(defaultHero);
                    if(defaultHeroCaption) imgWrap.appendChild(defaultHeroCaption);
                }
            } else if (val === 'template9') {
                // Template 9: Magazine Editorial (Editor's Note)
                canvas.classList.add('template-9');

                // 1. Build Header Banner
                const headerBanner = document.createElement('div');
                headerBanner.id = 't9-header-banner';
                headerBanner.className = 't9-header-banner';

                // Background upload button for the header banner
                const bgUploadBtn = document.createElement('div');
                bgUploadBtn.className = 't9-bg-upload-btn';
                bgUploadBtn.style = 'position:absolute; top:12px; right:16px; z-index:10;';
                bgUploadBtn.innerHTML = `
                    <button type="button" style="background:rgba(255,255,255,0.18); color:#fff; border:1px solid rgba(255,255,255,0.35); backdrop-filter:blur(6px); font-size:0.75rem; font-weight:600; padding:6px 12px; border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        &#128247; Header BG (1200x320 px)
                    </button>
                    <input type="file" class="t9-bg-input" accept="image/*" style="display:none;" />
                `;

                const bgBtn = bgUploadBtn.querySelector('button');
                const bgInput = bgUploadBtn.querySelector('input');
                if(bgBtn && bgInput) {
                    bgBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        bgInput.click();
                    });
                    bgInput.addEventListener('change', async function() {
                        const file = this.files[0];
                        if(file) {
                            const tempUrl = URL.createObjectURL(file);
                            headerBanner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${tempUrl}')`;
                            headerBanner.style.backgroundSize = 'cover';
                            headerBanner.style.backgroundPosition = 'center';

                            try {
                                const cdnUrl = await uploadToCloudinary(file);
                                headerBanner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${cdnUrl}')`;
                                console.log('Template 9 header background uploaded to Cloudinary:', cdnUrl);
                            } catch(err) {
                                console.error('Cloudinary bg upload error:', err);
                                alert('Cloudinary Upload Failed: ' + err.message);
                            }
                        }
                    });
                }
                headerBanner.appendChild(bgUploadBtn);

                const headerLeft = document.createElement('div');
                headerLeft.className = 't9-header-left';
                
                const badge = document.createElement('span');
                badge.className = 't9-badge';
                badge.textContent = 'EDITORIAL';
                headerLeft.appendChild(badge);

                if(defaultTitle) {
                    headerLeft.appendChild(defaultTitle);
                }

                const authorCol = document.createElement('div');
                authorCol.className = 't9-author-col';
                if(defaultHero) {
                    authorCol.appendChild(defaultHero);
                    if(defaultHeroCaption) authorCol.appendChild(defaultHeroCaption);
                }

                headerBanner.appendChild(headerLeft);
                headerBanner.appendChild(authorCol);

                const topAd = document.getElementById('ad-top');
                if(topAd) topAd.after(headerBanner);
                else canvas.insertBefore(headerBanner, canvas.firstChild);

                // 2. Build 2-Column Body (Left: Content & Dropzone, Right: Quote Card)
                const contentGrid = document.createElement('div');
                contentGrid.id = 't9-content-grid';
                contentGrid.className = 't9-content-grid';

                const leftCol = document.createElement('div');
                leftCol.className = 't9-left-col';

                if(defaultContent) leftCol.appendChild(defaultContent);
                if(dropzone) leftCol.appendChild(dropzone);

                const rightCol = document.createElement('div');
                rightCol.className = 't9-right-col';
                
                const quoteCard = document.createElement('div');
                quoteCard.className = 't9-quote-card';
                quoteCard.innerHTML = `
                    <span class="t9-quote-mark">&#10077;</span>
                    <div contenteditable="true" class="t9-quote-text edit-text" placeholder="Type key takeaway or editor's highlight quote here...">
                        Inspiring journalism connecting communities with integrity and purpose.
                    </div>
                `;
                rightCol.appendChild(quoteCard);

                contentGrid.appendChild(leftCol);
                contentGrid.appendChild(rightCol);

                if(articleContainer) {
                    articleContainer.appendChild(contentGrid);
                }
            }
        });
    }

    // --- CLOUDINARY CONFIGURATION & UPLOAD HELPER ---
    const CLOUDINARY_CLOUD_NAME = 'xlzab0vf';
    const CLOUDINARY_UPLOAD_PRESET = 'l1wscesh';

    async function uploadToCloudinary(file) {
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || 'Cloudinary upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    }

    // --- 1. HERO IMAGE LOGIC ---
    if(defaultHero && defaultHeroInput) {
        defaultHero.addEventListener('click', (e) => {
            // Prevent triggering upload if user is clicking on text blocks inside the hero
            if(e.target.closest('#default-title') || e.target.closest('.meta-data') || e.target.closest('#default-content')) return;
            if(e.target !== defaultHeroInput) defaultHeroInput.click();
        });
        defaultHeroInput.addEventListener('change', function() {
            const file = this.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    defaultHeroImg.src = e.target.result;
                    defaultHeroImg.style.display = 'block';
                    if(defaultHeroPh) defaultHeroPh.style.display = 'none';
                    if(defaultHeroOverlay) defaultHeroOverlay.style.display = 'none';

                    try {
                        const cdnUrl = await uploadToCloudinary(file);
                        defaultHeroImg.src = cdnUrl;
                        console.log('Hero image successfully uploaded to Cloudinary:', cdnUrl);
                    } catch (err) {
                        console.error('Cloudinary upload error, using local fallback:', err);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 2. DRAG AND DROP ENGINE (SMART ADS) ---
    document.querySelectorAll('.tool-item').forEach(tool => {
        tool.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', tool.dataset.type);
        });
    });

    if(dropzone) {
        let lastTarget = null;
        document.getElementById('main-canvas').addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            const target = e.target.closest('.inner-dropzone') || dropzone; 
            if(target !== lastTarget) { 
                if(lastTarget) lastTarget.classList.remove('drag-hover');
                if(target) target.classList.add('drag-hover'); 
                lastTarget = target;
            } 
        });
        document.getElementById('main-canvas').addEventListener('dragleave', (e) => { 
            const rect = document.getElementById('main-canvas').getBoundingClientRect();
            if(e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom) {
                if(lastTarget) lastTarget.classList.remove('drag-hover');
                lastTarget = null;
            }
        });
        
        document.getElementById('main-canvas').addEventListener('drop', (e) => {
            e.preventDefault();
            document.querySelectorAll('.drag-hover').forEach(el => el.classList.remove('drag-hover'));
            
            const type = e.dataTransfer.getData('type');
            if(!type) return;

            // SMART AD ROUTING
            if(type === 'ad-h') {
                const adTop = document.getElementById('ad-top');
                const adBottom = document.getElementById('ad-bottom');
                if(adTop && adTop.style.display === 'none') {
                    adTop.style.display = 'flex';
                } else if(adBottom && adBottom.style.display === 'none') {
                    adBottom.style.display = 'flex';
                } else {
                    alert('Both Top and Bottom Banner ad slots are already filled!');
                }
                return;
            }
            if(type === 'ad-v') {
                const adSidebar = document.getElementById('ad-sidebar');
                if(adSidebar && adSidebar.style.display === 'none') {
                    adSidebar.style.display = 'flex';
                    adSidebar.parentElement.classList.add('active');
                } else {
                    alert('Sidebar Ad slot is already filled!');
                }
                return;
            }
            if(type === 'ad-sq') {
                // Moved to Normal Elements
            }

            // Normal Elements
            let targetDropzone = e.target.closest('.inner-dropzone') || e.target.closest('#dropzone');
            if(targetDropzone) {
                let block = document.createElement('div');
                block.className = 'canvas-block';
                
                if(type === 'split') {
                    if(targetDropzone.classList.contains('inner-dropzone')) {
                        alert('Cannot place a split layout inside another split layout.');
                        return;
                    }
                    block.classList.add('split-block');
                    block.dataset.type = 'split';
                    block.innerHTML = `<button class="block-del" title="Delete Block">&times;</button>
                        <div class="split-container" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; padding-top:20px;">
                            <div class="inner-dropzone" style="border:1px dashed #ccc; padding:16px; min-height:100px;"></div>
                            <div class="inner-dropzone" style="border:1px dashed #ccc; padding:16px; min-height:100px;"></div>
                        </div>`;
                } else {
                    block.dataset.type = (type === 'ad-sq') ? 'ad' : type;

                    let inner = '';
                    if(type === 'p') inner = '<div contenteditable="true" class="edit-text edit-p" data-type="text" placeholder="Start typing new paragraph..."></div>';
                    if(type === 'img') inner = '<div class="img-ph" style="display:flex; flex-direction:column; gap:6px; justify-content:center; align-items:center; cursor:pointer;"><span>[img] Click to upload image</span><span style="font-size:0.75rem; color:#64748b; background:#e2e8f0; padding:2px 8px; border-radius:10px; font-weight:600;">Recommended: 800 x 500 px (16:9)</span></div><img src="" style="display:none; width:100%; object-fit:cover; border-radius:4px;" /><input type="file" class="hidden-file-input" accept="image/*" style="display:none;">';
                    if(type === 'vid') inner = '<div class="vid-ph">&#9654; Click here, then set YouTube URL in the right panel</div><iframe src="" style="display:none; width:100%; aspect-ratio:16/9; border:none; border-radius:4px;" allowfullscreen></iframe>';
                    if(type === 'ad-sq') inner = `<aside class="ad-inline ad-square" contenteditable="false" style="background:#f9f9f9; border:1px solid #e0e0e0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; min-height:250px;">
                        <span style="font-size:0.7rem; color:#888; text-transform:uppercase; margin-bottom:8px;">Advertisement</span>
                        <div style="font-weight:600; color:#aaa;">Inline Square Ad<br/>(300x250)</div>
                    </aside>`;

                    block.innerHTML = `<button class="block-del" title="Delete Block">&times;</button>${inner}`;
                }

                // Determine insert position based on where user dropped it
                const hoverBlock = e.target.closest('.canvas-block');
                if (hoverBlock && hoverBlock.parentElement === targetDropzone) {
                    const rect = hoverBlock.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        hoverBlock.before(block);
                    } else {
                        hoverBlock.after(block);
                    }
                } else {
                    targetDropzone.appendChild(block);
                }
                
                window.bindBlock(block);
            }
        });
    }

    // Robust event delegation for all remove-ad buttons
    document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-ad');
        if (removeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const parentAd = removeBtn.closest('.predefined-ad') || removeBtn.parentElement;
            if (parentAd) {
                parentAd.style.display = 'none';
                const sidebarContainer = parentAd.closest('.article-sidebar');
                if (sidebarContainer) {
                    sidebarContainer.classList.remove('active');
                }
            }
        }
    });

        document.querySelectorAll('.move-ad-left').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.article-layout-wrapper').classList.add('sidebar-left');
            btn.style.display = 'none';
            btn.nextElementSibling.style.display = 'block';
        });
    });
    document.querySelectorAll('.move-ad-right').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.article-layout-wrapper').classList.remove('sidebar-left');
            btn.style.display = 'none';
            btn.previousElementSibling.style.display = 'block';
        });
    });

    // --- 3. SELECTION & PANEL SWITCHING ---
    window.bindBlock = function(block) {
        block.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (e.target.classList.contains('block-del')) {
                block.remove();
                activatePanel('meta');
                return;
            }

            clearActiveStates();
            block.classList.add('active');
            activeBlock = block;

            const type = block.dataset.type;
            if(type === 'p') {
                activatePanel('text');
                syncTextStyles(block.querySelector('.edit-text'));
            } else if(type === 'vid') {
                activatePanel('vid');
            } else if(type === 'split') {
                activatePanel('split');
                const ratioSelect = document.getElementById('split-layout-ratio');
                if(ratioSelect) ratioSelect.value = block.dataset.ratio || '1:1';
            } else {
                activatePanel('meta');
            }
        });

        if(block.dataset.type === 'img') {
            const ph = block.querySelector('.img-ph');
            const fileInput = block.querySelector('.hidden-file-input');
            const imgEl = block.querySelector('img');
            
            if(ph && fileInput) {
                ph.addEventListener('click', () => fileInput.click());
                imgEl.addEventListener('click', () => fileInput.click()); 
                
                fileInput.addEventListener('change', async function() {
                    const file = this.files[0];
                    if(file) {
                        // Instant local preview
                        const tempUrl = URL.createObjectURL(file);
                        imgEl.src = tempUrl;
                        imgEl.style.display = 'block';
                        ph.style.display = 'none';

                        try {
                            const cdnUrl = await uploadToCloudinary(file);
                            imgEl.src = cdnUrl;
                            console.log('Block image uploaded to Cloudinary:', cdnUrl);
                        } catch (err) {
                            console.error('Cloudinary upload error:', err);
                            alert('Cloudinary Upload Failed: ' + err.message);
                        }
                    }
                });
            }
        }
    }

    [defaultTitle, defaultContent, defaultHeroCaption].forEach(el => {
        if(el) {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                clearActiveStates();
                el.classList.add('active');
                activeBlock = el;
                activatePanel('text');
                syncTextStyles(el);
            });
        }
    });

    function clearActiveStates() {
        if(defaultTitle) defaultTitle.classList.remove('active');
        if(defaultContent) defaultContent.classList.remove('active');
        document.querySelectorAll('.canvas-block').forEach(b => b.classList.remove('active'));
    }

    document.body.addEventListener('mousedown', (e) => {
        if(e.target.closest('.form-panel') || e.target.closest('.publish-card') || e.target.closest('#dynamic-panels') || e.target.closest('.visual-canvas') || e.target.closest('.predefined-ad')) return;
        clearActiveStates();
        activeBlock = null;
        activatePanel('meta');
    });

    function activatePanel(type) {
        Object.values(panels).forEach(p => {
            if(p) p.style.display = 'none';
        });
        if(panels[type]) panels[type].style.display = 'block';
    }

    function rgbToHex(rgb) {
        const m = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if(m) {
            return "#" + 
                ("0" + parseInt(m[1], 10).toString(16)).slice(-2) +
                ("0" + parseInt(m[2], 10).toString(16)).slice(-2) +
                ("0" + parseInt(m[3], 10).toString(16)).slice(-2);
        }
        return rgb;
    }

    function syncTextStyles(el) {
        if(!el) return;
        const innerHeading = el.querySelector('h1, h2, h3, h4, h5, h6'); const computed = window.getComputedStyle(innerHeading || el);
        
        const tracking = parseFloat(computed.letterSpacing) || 0;
        const trackSlider = document.getElementById('fmt-tracking');
        if(trackSlider) trackSlider.value = tracking;

        const lineHt = computed.lineHeight;
        let leadVal = 1.8; 
        if (lineHt !== 'normal') {
            const pxLineHt = parseFloat(lineHt);
            const pxFontSz = parseFloat(computed.fontSize);
            if (!isNaN(pxLineHt) && !isNaN(pxFontSz) && pxFontSz > 0) {
                leadVal = (pxLineHt / pxFontSz).toFixed(1);
            }
        }
        const leadSlider = document.getElementById('fmt-leading');
        if(leadSlider) leadSlider.value = leadVal;

        const sizeSlider = document.getElementById('fmt-size-slider');
        const sizeInput = document.getElementById('fmt-size-input');
        if(sizeSlider || sizeInput) {
            const fs = parseFloat(computed.fontSize);
            if(!isNaN(fs)) {
                if(sizeSlider) sizeSlider.value = fs;
                if(sizeInput) sizeInput.value = fs;
            }
        }

        const colorPicker = document.getElementById('fmt-color');
        if(colorPicker && computed.color) {
            let hex = rgbToHex(computed.color);
            if(hex.startsWith('#')) colorPicker.value = hex;
        }
    }

    // --- PLAIN TEXT PASTE ---
    document.addEventListener('paste', (e) => {
        if (e.target.closest('.visual-canvas') && e.target.isContentEditable) {
            e.preventDefault();
            const text = (e.originalEvent || e).clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        }
    });

    

    const splitRatioSelect = document.getElementById('split-layout-ratio');
    if (splitRatioSelect) {
        splitRatioSelect.addEventListener('change', e => {
            if (activeBlock && activeBlock.dataset.type === 'split') {
                const ratio = e.target.value;
                activeBlock.dataset.ratio = ratio;
                const container = activeBlock.querySelector('.split-container');
                
                let currentCols = container.querySelectorAll('.inner-dropzone').length;
                let targetCols = ratio === '1:1:1' ? 3 : 2;
                
                while(currentCols < targetCols) {
                    const newCol = document.createElement('div');
                    newCol.className = 'inner-dropzone';
                    newCol.style = 'border:1px dashed #ccc; padding:16px; min-height:100px;';
                    container.appendChild(newCol);
                    currentCols++;
                }
                while(currentCols > targetCols) {
                    if (container.lastElementChild.classList.contains('inner-dropzone')) {
                        container.lastElementChild.remove();
                        currentCols--;
                    } else { break; }
                }
                
                if (ratio === '1:1') container.style.gridTemplateColumns = '1fr 1fr';
                else if (ratio === '1:2') container.style.gridTemplateColumns = '1fr 2fr';
                else if (ratio === '2:1') container.style.gridTemplateColumns = '2fr 1fr';
                else if (ratio === '1:1:1') container.style.gridTemplateColumns = '1fr 1fr 1fr';
            }
        });
    }

    // --- 4. FORMATTING CONTROLS ---
    function applyFormat(cmd, val) {
        const sel = window.getSelection();
        const hasSelection = sel.rangeCount > 0 && !sel.isCollapsed && document.getElementById('main-canvas').contains(sel.anchorNode);

        if (hasSelection) {
            document.execCommand(cmd, false, val);
        } else if (activeBlock) {
            const target = activeBlock.classList.contains('edit-text') ? activeBlock : activeBlock.querySelector('.edit-text');
            if (!target) return;

            if (cmd === 'bold') {
                target.style.fontWeight = (target.style.fontWeight === 'bold' || parseInt(target.style.fontWeight) > 600) ? 'normal' : 'bold';
            } else if (cmd === 'italic') {
                target.style.fontStyle = target.style.fontStyle === 'italic' ? 'normal' : 'italic';
            } else if (cmd === 'underline') {
                target.style.textDecoration = target.style.textDecoration === 'underline' ? 'none' : 'underline';
            } else if (cmd === 'justifyLeft') target.style.textAlign = 'left';
            else if (cmd === 'justifyCenter') target.style.textAlign = 'center';
            else if (cmd === 'justifyRight') target.style.textAlign = 'right';
            else if (cmd === 'justifyFull') target.style.textAlign = 'justify';
            else if (cmd === 'foreColor') target.style.color = val;
            else if (cmd === 'fontName') target.style.fontFamily = val;
            else if (cmd === 'fontSizePx') { target.style.fontSize = val + 'px'; const heading = target.querySelector('h1, h2, h3, h4, h5, h6'); if(heading) heading.style.fontSize = val + 'px'; }
            else if (cmd === 'formatBlock') { document.execCommand(cmd, false, val); setTimeout(() => syncTextStyles(activeBlock), 10); } 
        }
    }

    document.querySelectorAll('.fmt-btn').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            applyFormat(btn.dataset.cmd, null);
        });
    });

    const blockSelect = document.getElementById('fmt-block');
    if(blockSelect) blockSelect.addEventListener('change', e => applyFormat('formatBlock', e.target.value));

    const fontSelect = document.getElementById('fmt-font');
    if(fontSelect) fontSelect.addEventListener('change', e => applyFormat('fontName', e.target.value));

    const colorPicker = document.getElementById('fmt-color');
    if(colorPicker) colorPicker.addEventListener('input', e => applyFormat('foreColor', e.target.value));

    const sizeSlider = document.getElementById('fmt-size-slider');
    const sizeInput = document.getElementById('fmt-size-input');
    
    if(sizeSlider) {
        sizeSlider.addEventListener('input', e => {
            if(sizeInput) sizeInput.value = e.target.value;
            applyFormat('fontSizePx', e.target.value);
        });
    }
    if(sizeInput) {
        sizeInput.addEventListener('input', e => {
            if(sizeSlider) sizeSlider.value = e.target.value;
            applyFormat('fontSizePx', e.target.value);
        });
    }

    const trackingSlider = document.getElementById('fmt-tracking');
    if(trackingSlider) {
        trackingSlider.addEventListener('input', e => {
            if(activeBlock) {
                const target = activeBlock.classList.contains('edit-text') ? activeBlock : activeBlock.querySelector('.edit-text');
                if(target) target.style.letterSpacing = e.target.value + 'px';
            }
        });
    }

    const leadingSlider = document.getElementById('fmt-leading');
    if(leadingSlider) {
        leadingSlider.addEventListener('input', e => {
            if(activeBlock) {
                const target = activeBlock.classList.contains('edit-text') ? activeBlock : activeBlock.querySelector('.edit-text');
                if(target) target.style.lineHeight = e.target.value;
            }
        });
    }

    // --- 5. VIDEO SETTINGS ---
    const vidUrl = document.getElementById('vid-url');
    const btnSetVid = document.getElementById('btn-set-vid');
    if(btnSetVid && vidUrl) {
        btnSetVid.addEventListener('click', () => {
            if(!activeBlock || activeBlock.dataset.type !== 'vid') return;
            const iframe = activeBlock.querySelector('iframe');
            const ph = activeBlock.querySelector('.vid-ph');
            if(iframe && vidUrl.value) {
                iframe.src = vidUrl.value;
                iframe.style.display = 'block';
                if(ph) ph.style.display = 'none';
                vidUrl.value = ''; 
                activatePanel('meta');
            }
        });
    }

    // --- NEW ARTICLE BUTTON ---
    const btnNew = document.getElementById('btn-new-article');
    if (btnNew) {
        btnNew.addEventListener('click', () => {
            if (confirm('Create a new blank article? Unsaved changes in the current editor will be cleared.')) {
                window.location.reload();
            }
        });
    }

    // --- 6. PUBLISH LOGIC ---
    const publishBtn = document.getElementById('publish-btn');
    if(publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const title = defaultTitle ? defaultTitle.textContent.trim() : '';
            const media = (defaultHeroImg && defaultHeroImg.style.display !== 'none') ? defaultHeroImg.src : '';
            const catSelect = document.getElementById('news-cat');
            const category = catSelect ? catSelect.options[catSelect.selectedIndex].text : 'News';
            const excerpt = document.getElementById('news-excerpt') ? document.getElementById('news-excerpt').value.trim() : '';
            const chosenTemplate = tplSelect ? tplSelect.value : 'template1';

            if(!title) { alert("Please type a main headline before publishing!"); return; }

            const ads = {
                top: document.getElementById('ad-top') && document.getElementById('ad-top').style.display !== 'none',
                sidebar: document.getElementById('ad-sidebar') && document.getElementById('ad-sidebar').style.display !== 'none',
                bottom: document.getElementById('ad-bottom') && document.getElementById('ad-bottom').style.display !== 'none'
            };

            let finalContent = '';
            
            if(defaultContent) {
                let p = defaultContent.innerHTML.trim();
                let styles = defaultContent.getAttribute('style') || '';
                if(!p.includes('Start writing')) {
                    finalContent += `<div style="${styles}" class="article-text">${p}</div>`;
                }
            }

            if(dropzone) {
                const clone = dropzone.cloneNode(true);
                clone.querySelectorAll('.block-del, .img-ph, .vid-ph, .drop-hint, .hidden-file-input').forEach(el => el.remove());
                clone.querySelectorAll('[contenteditable]').forEach(el => {
                    el.removeAttribute('contenteditable');
                    el.removeAttribute('placeholder');
                    el.classList.remove('edit-text', 'edit-p', 'active');
                });
                
                clone.querySelectorAll('.canvas-block').forEach(el => {
                    const type = el.dataset.type;
                    
                    if(type === 'p') {
                        const innerTextDiv = el.querySelector('div[data-type="text"]');
                        if(innerTextDiv) {
                            let styles = innerTextDiv.getAttribute('style') || '';
                            finalContent += `<div style="${styles}" class="article-text">${innerTextDiv.innerHTML}</div>`;
                        }
                    } else if(type === 'img') {
                        const img = el.querySelector('img');
                        if(img && img.style.display !== 'none') {
                            img.removeAttribute('style');
                            finalContent += `<figure class="article-media" style="margin:24px 0;"><img src="${img.src}" style="width:100%; border-radius:4px;"/></figure>`;
                        }
                    } else if(type === 'vid') {
                        const iframe = el.querySelector('iframe');
                        if(iframe && iframe.style.display !== 'none') {
                            iframe.removeAttribute('style');
                            finalContent += `<figure class="article-media" style="margin:24px 0;"><iframe src="${iframe.src}" style="width:100%; aspect-ratio:16/9; border:none; border-radius:4px;" allowfullscreen></iframe></figure>`;
                        }
                    } else if(type === 'ad') {
                        const ad = el.querySelector('.ad-inline');
                        if(ad) finalContent += ad.outerHTML;
                    }
                });
            }
            // Canvas Clone preparation & Element Preservation
            const canvasClone = document.getElementById('main-canvas').cloneNode(true);
            canvasClone.querySelectorAll('.remove-ad, .move-ad-left, .move-ad-right, .block-del, .drop-hint, .hero-subject-placeholder, #default-hero-overlay, .hidden-file-input, .t9-bg-upload-btn').forEach(el => el.remove());

            const clonedCaption = canvasClone.querySelector('#default-hero-caption');
            if (clonedCaption && clonedCaption.textContent.trim() === '') {
                clonedCaption.remove();
            }

            const adminSidebar = document.getElementById('ad-sidebar');
            const clonedSidebar = canvasClone.querySelector('#ad-sidebar, .ad-vertical');
            if (adminSidebar && adminSidebar.style.display !== 'none' && clonedSidebar) {
                clonedSidebar.style.display = 'flex';
                const sidebarParent = clonedSidebar.closest('.article-sidebar');
                if (sidebarParent) {
                    sidebarParent.classList.add('active');
                    sidebarParent.style.display = 'block';
                }
            } else if (clonedSidebar) {
                const sidebarParent = clonedSidebar.closest('.article-sidebar');
                if (sidebarParent) sidebarParent.classList.remove('active');
            }

            // 1. Process all dropped canvas blocks FIRST to extract their content
            canvasClone.querySelectorAll('.canvas-block').forEach(el => {
                const type = el.dataset.type;
                if (type === 'p') {
                    const inner = el.querySelector('[data-type="text"], .edit-p, .edit-text, div');
                    if (inner && inner.textContent.trim() !== '') {
                        const p = document.createElement('div');
                        p.className = 'article-text';
                        const existingStyle = inner.getAttribute('style') || '';
                        p.style.cssText = existingStyle ? existingStyle : 'font-size: 1.15rem; margin-bottom: 28px; line-height: 1.8;';
                        p.innerHTML = inner.innerHTML;
                        el.replaceWith(p);
                    } else {
                        el.remove();
                    }
                } else if (type === 'img') {
                    const img = el.querySelector('img');
                    if (img && img.src && img.style.display !== 'none' && !img.src.endsWith('/') && !img.src.endsWith('.html')) {
                        const fig = document.createElement('figure');
                        fig.className = 'article-media';
                        fig.style.cssText = 'margin: 28px 0;';
                        fig.innerHTML = `<img src="${img.src}" style="width:100%; border-radius:6px; display:block;" />`;
                        el.replaceWith(fig);
                    } else {
                        el.remove();
                    }
                } else if (type === 'split') {
                    const container = el.querySelector('.split-container');
                    if (container) {
                        el.replaceWith(container);
                    } else {
                        el.remove();
                    }
                } else if (type === 'vid') {
                    const iframe = el.querySelector('iframe');
                    if (iframe && iframe.src && iframe.style.display !== 'none') {
                        const fig = document.createElement('figure');
                        fig.className = 'article-media';
                        fig.style.cssText = 'margin: 28px 0;';
                        fig.innerHTML = `<iframe src="${iframe.src}" style="width:100%; aspect-ratio:16/9; border:none; border-radius:6px;" allowfullscreen></iframe>`;
                        el.replaceWith(fig);
                    } else {
                        el.remove();
                    }
                } else if (type === 'ad' || type === 'ad-sq' || type === 'ad-h') {
                    const ad = el.querySelector('.ad-inline, .ad-square, .ad-horizontal');
                    if (ad) {
                        el.replaceWith(ad);
                    } else {
                        el.remove();
                    }
                } else {
                    el.classList.remove('canvas-block', 'active');
                }
            });

            // 2. Clean up inner dropzone containers and editable markers
            canvasClone.querySelectorAll('.inner-dropzone').forEach(el => { 
                el.style.border = 'none'; 
                el.style.minHeight = '0'; 
                el.classList.remove('inner-dropzone'); 
            });

            canvasClone.querySelectorAll('[contenteditable]').forEach(el => {
                el.removeAttribute('contenteditable');
                el.removeAttribute('placeholder');
                el.classList.remove('edit-text', 'edit-p', 'active');
            });

            const fullHTML = canvasClone.outerHTML;
            const adminHTML = document.getElementById('main-canvas').innerHTML; // Save exact builder state
            
            const isEditing = document.getElementById('main-canvas').dataset.editId;

            const statusEl = document.getElementById('article-status');
            const status = statusEl ? statusEl.value : 'Published';

            const article = {
                id: isEditing || 'art-' + Date.now(),
                template: chosenTemplate,
                ads: ads, 
                title, excerpt, category, content: finalContent, media,
                fullHTML: fullHTML,
                adminHTML: adminHTML,
                status: status,
                date: new Date().toISOString()
            };

            publishBtn.disabled = true;
            publishBtn.textContent = 'Publishing to Cloud...';

            try {
                if (isEditing) {
                    await updateArticle(article.id, article);
                } else {
                    await addArticle(article);
                }
                
                publishBtn.disabled = false;
                publishBtn.textContent = 'Published!';

                const successCard = document.getElementById('publish-success-card');
                const viewLiveBtn = document.getElementById('view-live-btn');
                const statusText = document.getElementById('publish-status-text');
                const copyShortBtn = document.getElementById('copy-short-btn');
                
                const fullArticleUrl = getArticleLandingUrl(article.id);

                if(successCard && viewLiveBtn && statusText) {
                    successCard.style.background = '#f0fdf4';
                    successCard.style.border = '1px solid #bbf7d0';
                    successCard.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                    statusText.innerHTML = '&#10003; Published Successfully to Cloud!';
                    statusText.style.color = '#166534';
                    statusText.style.fontWeight = '600';
                    statusText.style.marginBottom = '12px';
                    statusText.style.fontSize = '0.85rem';
                    viewLiveBtn.style.display = 'block';
                    viewLiveBtn.href = fullArticleUrl;

                    if (copyShortBtn) {
                        copyShortBtn.style.display = 'block';
                        copyShortBtn.textContent = '🔗 Copy Short Link';
                        copyShortBtn.onclick = async () => {
                            copyShortBtn.textContent = 'Generating...';
                            const shortUrl = await generateShortUrl(fullArticleUrl);
                            try {
                                await navigator.clipboard.writeText(shortUrl);
                                copyShortBtn.textContent = '✓ Short Link Copied!';
                            } catch (e) {
                                prompt('Copy your short link:', shortUrl);
                                copyShortBtn.textContent = '🔗 Copy Short Link';
                            }
                            setTimeout(() => { copyShortBtn.textContent = '🔗 Copy Short Link'; }, 2500);
                        };
                    }
                }
            } catch (err) {
                console.error("Publish Error:", err);
                publishBtn.disabled = false;
                publishBtn.textContent = 'Publish Failed';
                alert('Cloud Publish Failed: ' + (err.message || 'Unknown Firestore Error'));
            }

            setTimeout(() => {
                publishBtn.textContent = 'Publish Live';
            }, 2000);
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
            if (manageBody) manageBody.innerHTML = '<div style="text-align:center; padding: 40px; color: #64748b;"><h3>Loading articles from Cloud...</h3></div>';
            await renderManageArticles();
        });

        btnCloseManage.addEventListener('click', () => {
            modalManage.style.display = 'none';
        });

        // Close on clicking outside
        modalManage.addEventListener('click', (e) => {
            if(e.target === modalManage) {
                modalManage.style.display = 'none';
            }
        });
    }

    async function renderManageArticles() {
        if(!manageBody) return;
        let articles = [];
        try {
            articles = await getArticlesAsync();
        } catch (err) {
            console.warn("Failed to fetch async articles, falling back to local:", err);
            articles = getArticles();
        }

        if(!articles || articles.length === 0) {
            manageBody.innerHTML = '<div style="text-align:center; padding: 40px; color: #64748b;"><h3>No articles published yet.</h3><p>Create an article and click Publish Live to see it here.</p></div>';
            return;
        }

        let html = '<div class="article-grid">';
        articles.forEach(art => {
            if (!art) return;
            const dateStr = art.date ? new Date(art.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : 'Recent';
            
            // Use placeholder if no media
            let imgHtml = art.media ? `<img src="${art.media}" class="m-card-img" />` : `<div class="m-card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;">📰</div>`;
            const fullArticleUrl = getArticleLandingUrl(art.id || 'seed-1');

            const statusBadge = art.status === 'Draft' 
                ? '<span class="m-status-badge" style="background:#eab308; color:#fff;">Draft</span>'
                : '<span class="m-status-badge">Published</span>';

            html += `
                <div class="m-card" data-id="${art.id}">
                    ${statusBadge}
                    ${imgHtml}
                    <div class="m-card-body">
                        <div class="m-card-cat">${art.category || 'News'}</div>
                        <h3 class="m-card-title">${art.title || 'Untitled Article'}</h3>
                        <div class="m-card-date">🕒 ${dateStr}</div>
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
    }

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

    window.removeArticle = async function(id) {
        if(confirm('Are you sure you want to permanently delete this article? This action cannot be undone.')) {
            await deleteArticle(id);
            await renderManageArticles(); // Refresh list
        }
    };

    window.editArticle = function(id) {
        const art = getArticleById(id);
        if(!art) return;
        
        // 1. Set editing ID
        const canvas = document.getElementById('main-canvas');
        if(!canvas) return;
        canvas.dataset.editId = id;
        
        // 2. Restore content
        if (art.adminHTML) {
            canvas.innerHTML = art.adminHTML;
            // Inject caption box if editing an old article that didn't have it
            const existingHero = canvas.querySelector('#default-hero');
            if (existingHero && !canvas.querySelector('#default-hero-caption')) {
                const newCaption = document.createElement('div');
                newCaption.className = 'hero-caption edit-text';
                newCaption.id = 'default-hero-caption';
                newCaption.setAttribute('contenteditable', 'true');
                newCaption.setAttribute('placeholder', 'Image Credit / Caption (Optional)');
                existingHero.after(newCaption);
            }
            
            // Re-bind all blocks for interactivity
            canvas.querySelectorAll('.canvas-block').forEach(block => {
                if (typeof window.bindBlock === 'function') {
                    window.bindBlock(block);
                }
            });
        } else if (art.fullHTML) {
            // Fallback for older articles without adminHTML
            canvas.innerHTML = art.fullHTML;
            // Best-effort to restore editability
            canvas.querySelectorAll('.article-text, h1, h2, span').forEach(el => {
                if(!el.closest('.t9-quote-mark') && !el.closest('.meta-data')) {
                    el.setAttribute('contenteditable', 'true');
                    el.classList.add('edit-text');
                }
            });
            // Show placeholders again if empty
            const ph = canvas.querySelector('.hero-subject-placeholder');
            if(!ph) {
                // Not perfect, but we try
            }
        } else {
            // very old articles
            canvas.innerHTML = art.content; 
        }

        // Inject caption box if missing in fallback cases
        const existingHeroGlobal = canvas.querySelector('#default-hero');
        if (existingHeroGlobal && !canvas.querySelector('#default-hero-caption')) {
            const newCaption = document.createElement('div');
            newCaption.className = 'hero-caption edit-text';
            newCaption.id = 'default-hero-caption';
            newCaption.setAttribute('contenteditable', 'true');
            newCaption.setAttribute('placeholder', 'Image Credit / Caption (Optional)');
            existingHeroGlobal.after(newCaption);
        }

        // Restore Status Selection
        const statusEl = document.getElementById('article-status');
        if (statusEl && art.status) {
            statusEl.value = art.status;
        } else if (statusEl) {
            statusEl.value = 'Published';
        }

        // 3. Restore Category Selection
        const catSelect = document.getElementById('news-cat');
        if(catSelect) {
            for(let i=0; i<catSelect.options.length; i++) {
                if(catSelect.options[i].text === art.category) {
                    catSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Restore Template selection visually (does not rebuild canvas since it's already built)
        const tplSelect = document.getElementById('template-selector');
        if (tplSelect && art.template) {
            tplSelect.value = art.template;
        }

        // Close modal
        modalManage.style.display = 'none';
        
        alert('Article loaded into editor! Make your changes and click "Publish Live" to update.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
});

// --- ANALYTICS DASHBOARD SYSTEM ---
document.addEventListener('DOMContentLoaded', () => {
    const btnAnalytics = document.getElementById('btn-analytics-dashboard');
    const modalAnalytics = document.getElementById('analytics-dashboard-modal');
    const btnCloseAnalytics = document.getElementById('analytics-modal-close');

    if (btnAnalytics && modalAnalytics) {
        let trafficChartInstance = null;

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
            
            // 1. Calculate Stats
            const totalViews = logs.length;
            document.getElementById('a-total-views').textContent = totalViews;

            const todayStr = new Date().toISOString().split('T')[0];
            const todayViews = logs.filter(l => l.date === todayStr).length;
            document.getElementById('a-today-views').textContent = todayViews;

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
            document.getElementById('a-top-page').textContent = topPage;

            // 2. Populate Table (Last 10 visits)
            const tbody = document.getElementById('a-traffic-log');
            if (tbody) {
                const recentLogs = [...logs].reverse().slice(0, 10);
                if (recentLogs.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No traffic data recorded yet. Visit the live site to generate data!</td></tr>';
                } else {
                    tbody.innerHTML = recentLogs.map(l => `
                        <tr>
                            <td>${l.date}</td>
                            <td>${l.time}</td>
                            <td style="font-weight:600; color:#3b82f6;">${l.page}</td>
                            <td style="font-size:0.8rem; color:#64748b;">${l.path}</td>
                        </tr>
                    `).join('');
                }
            }

            // 3. Render Chart.js
            const ctx = document.getElementById('trafficChart');
            if (ctx) {
                // Group data by last 7 days
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
                        plugins: {
                            legend: { display: false },
                            tooltip: { mode: 'index', intersect: false }
                        },
                        scales: {
                            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }
        }
    }
});
