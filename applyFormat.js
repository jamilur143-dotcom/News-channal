    // Track canvas selection to prevent loss when panel controls are used
    let savedCanvasRange = null;
    
    // Listen to selectionchange but ONLY save if the selection is valid inside canvas
    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const canvas = document.getElementById('main-canvas');
            if (canvas && canvas.contains(range.commonAncestorContainer)) {
                savedCanvasRange = range.cloneRange();
            }
        }
    });

    function applyFormat(cmd, val) {
        const sel = window.getSelection();
        let activeRange = null;
        let isCollapsed = true;

        const canvas = document.getElementById('main-canvas');
        
        // Use native selection if it's not collapsed and inside canvas
        if (sel.rangeCount > 0 && canvas && canvas.contains(sel.anchorNode) && !sel.isCollapsed) {
            activeRange = sel.getRangeAt(0);
            isCollapsed = false;
        } 
        // Fallback to saved selection (crucial because clicking panel controls often collapses native selection)
        else if (savedCanvasRange) {
            activeRange = savedCanvasRange;
            isCollapsed = savedCanvasRange.collapsed;
        }

        if (!activeRange) return;

        const blockCommands = ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'letterSpacing', 'lineHeight', 'width', 'minHeight', 'formatBlock'];
        
        // --- 1. BLOCK LEVEL COMMANDS ---
        if (blockCommands.includes(cmd)) {
            let node = activeRange.commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode;
            
            let target = node.closest('.edit-text') || node.closest('.canvas-block');
            if (!target && activeBlock) {
                target = activeBlock.classList.contains('edit-text') ? activeBlock : activeBlock.querySelector('.edit-text') || activeBlock;
            }
            if (!target) return;

            switch (cmd) {
                case 'justifyLeft':   target.style.textAlign = 'left';    break;
                case 'justifyCenter': target.style.textAlign = 'center';  break;
                case 'justifyRight':  target.style.textAlign = 'right';   break;
                case 'justifyFull':   target.style.textAlign = 'justify'; break;
                case 'letterSpacing': target.style.letterSpacing = val + 'px'; break;
                case 'lineHeight':    target.style.lineHeight = val; break;
                case 'width':
                    const wWrap = target.closest('.canvas-block') || target;
                    wWrap.style.width = val + '%';
                    break;
                case 'minHeight':
                    const hWrap = target.closest('.canvas-block') || target;
                    hWrap.style.minHeight = val ? (val + 'px') : 'auto';
                    break;
                case 'formatBlock':
                    if (target.id && target.id.startsWith('default-')) break;
                    if (target.closest('.meta-data')) break;
                    
                    const newTag = val.toUpperCase();
                    if (target.tagName === newTag) break;
                    
                    const newEl = document.createElement(newTag);
                    Array.from(target.attributes).forEach(attr => newEl.setAttribute(attr.name, attr.value));
                    newEl.innerHTML = target.innerHTML;
                    
                    target.parentNode.replaceChild(newEl, target);
                    if (activeBlock === target) activeBlock = newEl;
                    break;
            }
            setTimeout(() => syncTextStyles(activeBlock), 10);
            return;
        }

        // --- 2. INLINE / SELECTION COMMANDS ---
        if (isCollapsed) return;

        // Restore selection globally so execCommand targets it!
        sel.removeAllRanges();
        sel.addRange(activeRange);

        // Enable CSS styling for execCommand
        document.execCommand('styleWithCSS', false, true);

        switch (cmd) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'foreColor':
                document.execCommand('foreColor', false, val);
                break;
            case 'fontName':
                document.execCommand('fontName', false, val);
                break;
            case 'fontSizePx':
                document.execCommand('styleWithCSS', false, false);
                document.execCommand('fontSize', false, '7');
                const fonts = canvas.querySelectorAll('font[size="7"]');
                fonts.forEach(f => {
                    const span = document.createElement('span');
                    span.style.fontSize = val + 'px';
                    span.innerHTML = f.innerHTML;
                    f.parentNode.replaceChild(span, f);
                });
                document.execCommand('styleWithCSS', false, true);
                break;
        }

        // Re-save the active range after DOM modification
        if (sel.rangeCount > 0) {
            savedCanvasRange = sel.getRangeAt(0).cloneRange();
        }
        setTimeout(() => syncTextStyles(activeBlock), 10);
    }
