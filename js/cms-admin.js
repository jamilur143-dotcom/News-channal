document.addEventListener('DOMContentLoaded', () => {
    
    // --- AD SETTINGS LOGIC ---
    const adBannerInput = document.getElementById('global-ad-banner');
    const adScriptInput = document.getElementById('global-ad-script');
    const saveAdsBtn = document.getElementById('btn-save-ads');

    if (adBannerInput && adScriptInput && saveAdsBtn) {
        adBannerInput.value = localStorage.getItem('adBannerCode') || '';
        adScriptInput.value = localStorage.getItem('adPopunderCode') || '';

        saveAdsBtn.addEventListener('click', () => {
            localStorage.setItem('adBannerCode', adBannerInput.value);
            localStorage.setItem('adPopunderCode', adScriptInput.value);
            alert('Ad settings saved successfully!');
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
    const metaContainer = document.querySelector('.meta-data');
    const articleContainer = document.querySelector('.article-container');
    
    let activeBlock = null;

    // --- 0. TEMPLATE SWITCHER ---
    const tplSelect = document.getElementById('template-selector');
    if (tplSelect) {
        tplSelect.addEventListener('change', (e) => {
            const canvas = document.getElementById('main-canvas');
            
            // 1) RESET FIRST: Move elements back to their standard (Template 1) container order
            canvas.classList.remove('template-2', 'template-3', 'template-4', 'template-5', 'template-6', 'template-7', 'template-8');
            
            if(articleContainer && defaultTitle && metaContainer && defaultContent) {
                // Ensure they are inside article-container 
                articleContainer.prepend(defaultContent);
                articleContainer.prepend(metaContainer);
                articleContainer.prepend(defaultTitle);
                // Standard T1 Order: Title -> Meta -> Content
                defaultTitle.after(metaContainer); 
                metaContainer.after(defaultContent);
            }
            if(defaultHero) {
                const topAd = document.getElementById('ad-top');
                if(topAd) topAd.after(defaultHero); // Hero at the top
                else canvas.insertBefore(defaultHero, canvas.firstChild);
            }

            // Cleanup any temporary wrapper from T8
            const oldT8Split = document.getElementById('t8-split-wrap');
            if(oldT8Split) oldT8Split.remove();

            // 2) APPLY NEW TEMPLATE LAYOUT
            const val = e.target.value;
            if (val === 'template2') {
                // Template 2: Title -> Meta -> Hero -> Content
                canvas.classList.add('template-2');
                if(metaContainer && defaultHero) {
                    metaContainer.after(defaultHero);
                }
            } else if (val === 'template3') {
                // Template 3: Meta -> Title -> Intro Paragraph -> Hero -> Rest
                canvas.classList.add('template-3');
                if(defaultTitle && metaContainer) defaultTitle.before(metaContainer);
                if(defaultContent && defaultHero) defaultContent.after(defaultHero);
            } else if (val === 'template4') {
                // Template 4 (Magazine): Title -> Intro Content -> Hero -> Meta Grid -> Rest
                canvas.classList.add('template-4');
                if(defaultContent && defaultHero) defaultContent.after(defaultHero); 
                if(defaultHero && metaContainer) defaultHero.after(metaContainer); 
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
        defaultHeroInput.addEventListener('change', async function() {
            const file = this.files[0];
            if(file) {
                // Instant local preview
                const tempUrl = URL.createObjectURL(file);
                defaultHeroImg.src = tempUrl;
                defaultHeroImg.style.display = 'block';
                if(defaultHeroPh) defaultHeroPh.style.display = 'none';
                if(defaultHeroOverlay) defaultHeroOverlay.style.display = 'none';

                try {
                    const cdnUrl = await uploadToCloudinary(file);
                    defaultHeroImg.src = cdnUrl;
                    console.log('Hero image successfully uploaded to Cloudinary:', cdnUrl);
                } catch (err) {
                    console.error('Cloudinary upload error:', err);
                    alert('Cloudinary Upload Failed: ' + err.message);
                }
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
                const block = document.createElement('div');
                block.className = 'canvas-block';
                block.dataset.type = 'ad';
                block.innerHTML = `<button class="block-del" title="Delete Block">&times;</button>
                    <aside class="ad-inline ad-square" contenteditable="false" style="background:#f9f9f9; border:1px solid #e0e0e0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                        <span style="font-size:0.7rem; color:#888; text-transform:uppercase; margin-bottom:8px;">Advertisement</span>
                        <div style="font-weight:600; color:#aaa;">Inline Square Ad<br/>(300x250)</div>
                    </aside>`;
                dropzone.appendChild(block);
                bindBlock(block);
                return;
            }

            // Normal Elements
            let targetDropzone = e.target.closest('.inner-dropzone') || e.target.closest('#dropzone');
            if(targetDropzone) {
                if(type === 'split') {
                    if(targetDropzone.classList.contains('inner-dropzone')) {
                        alert('Cannot place a split layout inside another split layout.');
                        return;
                    }
                    const block = document.createElement('div');
                    block.className = 'canvas-block split-block';
                    block.dataset.type = 'split';
                    block.innerHTML = `<button class="block-del" title="Delete Block">&times;</button>
                        <div class="split-container" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; padding-top:20px;">
                            <div class="inner-dropzone" style="border:1px dashed #ccc; padding:16px; min-height:100px;"></div>
                            <div class="inner-dropzone" style="border:1px dashed #ccc; padding:16px; min-height:100px;"></div>
                        </div>`;
                    targetDropzone.appendChild(block);
                    bindBlock(block);
                } else {
                    const block = document.createElement('div');
                    block.className = 'canvas-block';
                    block.dataset.type = type;

                    let inner = '';
                    if(type === 'p') inner = '<div contenteditable="true" class="edit-text edit-p" data-type="text" placeholder="Start typing new paragraph..."></div>';
                    if(type === 'img') inner = '<div class="img-ph">[img] Click to upload image</div><img src="" style="display:none; width:100%; object-fit:cover; border-radius:4px;" /><input type="file" class="hidden-file-input" accept="image/*" style="display:none;">';
                    if(type === 'vid') inner = '<div class="vid-ph">&#9654; Click here, then set YouTube URL in the right panel</div><iframe src="" style="display:none; width:100%; aspect-ratio:16/9; border:none; border-radius:4px;" allowfullscreen></iframe>';

                    block.innerHTML = `<button class="block-del" title="Delete Block">&times;</button>${inner}`;
                    targetDropzone.appendChild(block);
                    bindBlock(block);
                }
            }
        });
    }

    document.querySelectorAll('.remove-ad').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.parentElement.style.display = 'none';
            if(btn.parentElement.id === 'ad-sidebar') btn.parentElement.parentElement.classList.remove('active');
        });
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
    function bindBlock(block) {
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

    [defaultTitle, defaultContent].forEach(el => {
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

    // --- 6. PUBLISH LOGIC ---
    const publishBtn = document.getElementById('publish-btn');
    if(publishBtn) {
        publishBtn.addEventListener('click', () => {
            const title = defaultTitle ? defaultTitle.innerText.trim() : '';
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

            // === NEW LOGIC: Extract entire fully-designed Canvas ===
            const canvasClone = document.getElementById('main-canvas').cloneNode(true);
            canvasClone.removeAttribute('id'); // don't conflict IDs on landing page
            
            // Clean up admin-only UI elements
            canvasClone.querySelectorAll('.remove-ad, .move-ad-left, .move-ad-right, .block-del, .drop-hint, .hero-subject-placeholder, #default-hero-overlay, .hidden-file-input').forEach(el => el.remove());
            
            // Remove contenteditable attributes and admin classes
            canvasClone.querySelectorAll('[contenteditable]').forEach(el => {
                el.removeAttribute('contenteditable');
                el.removeAttribute('placeholder');
                el.classList.remove('edit-text', 'edit-p', 'active');
            });
            
            // Format dropped blocks seamlessly
            canvasClone.querySelectorAll('.inner-dropzone').forEach(el => { el.style.border = 'none'; el.style.minHeight = '0'; el.classList.remove('inner-dropzone'); });
            canvasClone.querySelectorAll('.canvas-block').forEach(el => {
                el.classList.remove('canvas-block', 'active');
                if (el.dataset.type === 'p') {
                    const inner = el.querySelector('div[data-type="text"]');
                    if (inner) {
                        inner.classList.add('article-text');
                        el.replaceWith(inner); 
                    }
                } else if (el.dataset.type === 'img') {
                    const img = el.querySelector('img');
                    if(img && img.style.display !== 'none') {
                        img.removeAttribute('style');
                        el.innerHTML = `<figure class="article-media" style="margin:24px 0;"><img src="${img.src}" style="width:100%; border-radius:4px;"/></figure>`;
                    } else { el.remove(); }
                } else if (el.dataset.type === 'split') { const container = el.querySelector('.split-container'); if (container) { el.replaceWith(container); } } else if (el.dataset.type === 'vid') {
                    const iframe = el.querySelector('iframe');
                    if(iframe && iframe.style.display !== 'none') {
                        iframe.removeAttribute('style');
                        el.innerHTML = `<figure class="article-media" style="margin:24px 0;"><iframe src="${iframe.src}" style="width:100%; aspect-ratio:16/9; border:none; border-radius:4px;" allowfullscreen></iframe></figure>`;
                    } else { el.remove(); }
                } else if (el.dataset.type === 'ad') {
                    const ad = el.querySelector('.ad-inline');
                    if(ad) el.replaceWith(ad);
                    else el.remove();
                }
            });

            const fullHTML = canvasClone.outerHTML;

            const article = {
                id: 'art-' + Date.now(),
                template: chosenTemplate,
                ads: ads, 
                title, excerpt, category, content: finalContent, media,
                fullHTML: fullHTML,
                date: new Date().toISOString()
            };

            addArticle(article);
            
            const successCard = document.getElementById('publish-success-card');
            const viewLiveBtn = document.getElementById('view-live-btn');
            const statusText = document.getElementById('publish-status-text');
            
            if(successCard && viewLiveBtn && statusText) {
                successCard.style.background = '#f0fdf4';
                successCard.style.border = '1px solid #bbf7d0';
                successCard.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                statusText.innerHTML = '&#10003; Published Successfully!';
                statusText.style.color = '#166534';
                statusText.style.fontWeight = '600';
                statusText.style.marginBottom = '12px';
                statusText.style.fontSize = '0.85rem';
                viewLiveBtn.style.display = 'block';
                viewLiveBtn.href = '../landing.html?id=' + article.id;
            }

            publishBtn.textContent = 'Published!';
            setTimeout(() => {
                publishBtn.textContent = 'Publish Live';
            }, 2000);
        });
    }
});


















