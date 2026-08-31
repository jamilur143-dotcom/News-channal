    function applyFormat(cmd, val) {
        const sel = window.getSelection();
        const hasSelection = sel.rangeCount > 0 && !sel.isCollapsed && document.getElementById('main-canvas').contains(sel.anchorNode);

        // --- 1. BLOCK LEVEL COMMANDS ---
        // Alignment, Tracking, Leading, Dimensions, and Tag Conversion affect the block.
        const blockCommands = ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'letterSpacing', 'lineHeight', 'width', 'minHeight', 'formatBlock'];
        
        if (blockCommands.includes(cmd)) {
            // Find the closest editable block from the selection
            let target = null;
            if (sel.rangeCount > 0) {
                let node = sel.anchorNode;
                if (node.nodeType === 3) node = node.parentNode; // text node
                target = node.closest('.edit-text') || node.closest('.canvas-block');
            }
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
                    
                    // Restore selection inside the new element
                    const newRange = document.createRange();
                    newRange.selectNodeContents(newEl);
                    newRange.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                    break;
            }
            return;
        }

        // --- 2. INLINE / SELECTION COMMANDS ---
        if (!hasSelection) {
            // "If no text is actively highlighted, the panel controls should do nothing."
            return;
        }

        const range = sel.getRangeAt(0);
        
        // Helper to apply CSS to the range by wrapping in a span
        const applySpanStyle = (cssProp, cssVal) => {
            try {
                const span = document.createElement('span');
                span.style[cssProp] = cssVal;
                const contents = range.extractContents();
                span.appendChild(contents);
                range.insertNode(span);
                
                // Keep it selected
                sel.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                sel.addRange(newRange);
            } catch (e) {
                console.error("Selection wrapping error:", e);
            }
        };

        switch (cmd) {
            case 'bold':
                // Check if already bold by looking at parent
                let isBold = false;
                let pNode = range.commonAncestorContainer;
                if(pNode.nodeType === 3) pNode = pNode.parentNode;
                if(window.getComputedStyle(pNode).fontWeight >= 700) isBold = true;
                applySpanStyle('fontWeight', isBold ? 'normal' : 'bold');
                break;
            case 'italic':
                let isItal = false;
                let iNode = range.commonAncestorContainer;
                if(iNode.nodeType === 3) iNode = iNode.parentNode;
                if(window.getComputedStyle(iNode).fontStyle === 'italic') isItal = true;
                applySpanStyle('fontStyle', isItal ? 'normal' : 'italic');
                break;
            case 'underline':
                let isUnd = false;
                let uNode = range.commonAncestorContainer;
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
    }
