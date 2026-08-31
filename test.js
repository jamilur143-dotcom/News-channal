const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(
  <html>
    <body>
      <div id="main-canvas" class="visual-canvas">
        <h1 id="default-title" class="edit-text active" contenteditable="true">Headline</h1>
      </div>
      <div id="panel-text">
        <button class="fmt-btn" data-cmd="bold">B</button>
        <input type="range" id="fmt-size-slider" value="20" />
      </div>
    </body>
  </html>
);
const window = dom.window;
const document = window.document;
global.document = document;
global.window = window;

let activeBlock = document.getElementById('default-title');
let syncTextStyles = () => {};

function getActiveTarget() {
    if (!activeBlock) return null;
    if (activeBlock.isContentEditable || activeBlock.classList.contains('edit-text')) {
        return activeBlock;
    }
    return activeBlock.querySelector('.edit-text') || activeBlock;
}

function applyFormat(cmd, val) {
    const target = getActiveTarget();
    if (!target) { console.log('no target'); return; }
    
    switch (cmd) {
        case 'bold':
            const isBold = window.getComputedStyle(target).fontWeight;
            target.style.fontWeight = (parseInt(isBold) >= 700 || isBold === 'bold') ? 'normal' : 'bold';
            break;
        case 'fontSizePx':
            target.style.fontSize = val + 'px';
            break;
    }
}

applyFormat('bold', null);
console.log('Weight after bold:', activeBlock.style.fontWeight);
applyFormat('fontSizePx', 30);
console.log('Size after font:', activeBlock.style.fontSize);

