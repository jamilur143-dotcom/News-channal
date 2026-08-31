    // Track canvas selection to prevent loss when panel controls are used
    let savedCanvasRange = null;
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
        if (sel.rangeCount > 0 && canvas && canvas.contains(sel.anchorNode)) {
            activeRange = sel.getRangeAt(0);
            isCollapsed = sel.isCollapsed;
        } else if (savedCanvasRange) {
            activeRange = savedCanvasRange;
            isCollapsed = savedCanvasRange.collapsed;
        }

        if (!activeRange) return; // No selection or cursor in canvas ever

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
        if (isCollapsed) return; // Strict directive: Do nothing if no text is highlighted

        const applySpanStyle = (cssProp, cssVal) => {
            try {
                const span = document.createElement('span');
                span.style[cssProp] = cssVal;
                const contents = activeRange.extractContents();
                span.appendChild(contents);
                activeRange.insertNode(span);
                
                // Re-select
                sel.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                sel.addRange(newRange);
                savedCanvasRange = newRange.cloneRange(); // update stored
            } catch (e) {
                console.error("Selection wrapping error:", e);
            }
        };

        switch (cmd) {
            case 'bold':
                let isBold = false;
                let pNode = activeRange.commonAncestorContainer;
                if(pNode.nodeType === 3) pNode = pNode.parentNode;
                if(window.getComputedStyle(pNode).fontWeight >= 700) isBold = true;
                applySpanStyle('fontWeight', isBold ? 'normal' : 'bold');
                break;
            case 'italic':
                let isItal = false;
                let iNode = activeRange.commonAncestorContainer;
                if(iNode.nodeType === 3) iNode = iNode.parentNode;
                if(window.getComputedStyle(iNode).fontStyle === 'italic') isItal = true;
                applySpanStyle('fontStyle', isItal ? 'normal' : 'italic');
                break;
            case 'underline':
                let isUnd = false;
                let uNode = activeRange.commonAncestorContainer;
                if(uNode.nodeType === 3) uNode = uNode.parentNode;
                if(window.getComputedStyle(uNode).textDecorationLine.includes('underline')) isUnd = true;
                applySpanStyle('textDecoration', isUnd ? 'none' : 'underline');
                break;
            case 'foreColor':
                applySpanStyle('color', val);
                break;
            case 'fontName':
                applySpanStyle('fontFamily', val);
                break;
            case 'fontSizePx':
                applySpanStyle('fontSize', val + 'px');
                break;
        }
        setTimeout(() => syncTextStyles(activeBlock), 10);
    }
