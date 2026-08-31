    // --- PREVENT SELECTION LOSS (STRICT DIRECTIVE) ---
    const panelText = document.getElementById('panel-text');
    if (panelText) {
        panelText.addEventListener('mousedown', (e) => {
            // STRICT DIRECTIVE: Prevent default on the ENTIRE panel to keep canvas text highlighted
            e.preventDefault(); 
            
            const target = e.target;
            const tag = target.tagName.toLowerCase();
            const type = (target.type || '').toLowerCase();

            // Native sliders break when mousedown is prevented. We implement custom dragging.
            if (tag === 'input' && type === 'range') {
                const updateSlider = (evt) => {
                    const rect = target.getBoundingClientRect();
                    let percent = (evt.clientX - rect.left) / rect.width;
                    percent = Math.max(0, Math.min(1, percent));
                    const min = parseFloat(target.min) || 0;
                    const max = parseFloat(target.max) || 100;
                    target.value = min + percent * (max - min);
                    target.dispatchEvent(new Event('input'));
                };
                updateSlider(e);
                
                const onMouseMove = (evt) => updateSlider(evt);
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
            
            // Color picker dialog requires manual trigger if prevented
            if (tag === 'input' && type === 'color') {
                setTimeout(() => target.click(), 10);
            }
            
            // Dropdowns require manual trigger if prevented (modern browsers only)
            if (tag === 'select') {
                if (typeof target.showPicker === 'function') {
                    setTimeout(() => target.showPicker(), 10);
                } else {
                    // Fallback: briefly restore selection after native focus
                    // But we can't because we just prevented default.
                }
            }
        });
    }
