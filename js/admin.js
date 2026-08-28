/* ============================================================
   NEXUSNEWS — Admin JavaScript
   Sidebar · Rich Text Editor · Drag-drop Upload · Form UX
   ============================================================ */

(function () {
  'use strict';

  /* ── Admin Sidebar (mobile) ──────────────────────────── */
  const sidebarToggle = document.querySelector('.admin-hamburger');
  const sidebar       = document.querySelector('.admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  /* ── Rich Text Editor ────────────────────────────────── */
  const editorContent = document.getElementById('editor-content');
  const wordCount     = document.getElementById('word-count');
  const charCount     = document.getElementById('char-count');

  if (editorContent) {
    // Toolbar command binding
    document.querySelectorAll('.toolbar-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', e => {
        e.preventDefault(); // keep focus in editor
        const cmd   = btn.dataset.cmd;
        const value = btn.dataset.value || null;
        document.execCommand(cmd, false, value);
        editorContent.focus();
        updateActiveStates();
        updateCounts();
      });
    });

    // Paragraph format select
    const fmtSelect = document.getElementById('format-select');
    if (fmtSelect) {
      fmtSelect.addEventListener('change', () => {
        document.execCommand('formatBlock', false, fmtSelect.value);
        editorContent.focus();
        fmtSelect.value = 'p';
      });
    }

    // Font size select
    const sizeSelect = document.getElementById('size-select');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', () => {
        document.execCommand('fontSize', false, sizeSelect.value);
        editorContent.focus();
      });
    }

    // Link insertion
    const linkBtn = document.querySelector('.toolbar-btn[data-cmd="createLink"]');
    if (linkBtn) {
      linkBtn.addEventListener('mousedown', e => {
        e.preventDefault();
        const url = prompt('Enter URL (including https://):');
        if (url) {
          document.execCommand('createLink', false, url);
          editorContent.focus();
        }
      });
    }

    // Update active toolbar states
    function updateActiveStates() {
      const cmds = ['bold', 'italic', 'underline', 'strikeThrough',
        'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
        'insertUnorderedList', 'insertOrderedList'];
      cmds.forEach(cmd => {
        const btn = document.querySelector(`.toolbar-btn[data-cmd="${cmd}"]`);
        if (btn) btn.classList.toggle('active', document.queryCommandState(cmd));
      });
    }

    // Word / character count
    function updateCounts() {
      const text = editorContent.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount) wordCount.textContent = `${words} words`;
      if (charCount) charCount.textContent = `${text.length} chars`;
    }

    editorContent.addEventListener('keyup',      updateCounts);
    editorContent.addEventListener('mouseup',    updateActiveStates);
    editorContent.addEventListener('selectionchange', updateActiveStates);
    document.addEventListener('selectionchange', updateActiveStates);

    // Paste as plain text (optional toggle)
    editorContent.addEventListener('paste', e => {
      const plain = document.getElementById('plain-paste-toggle');
      if (plain && plain.checked) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      }
    });
  }

  /* ── Drag-and-Drop Upload Zone ───────────────────────── */
  const uploadZone    = document.getElementById('upload-zone');
  const uploadInput   = document.getElementById('upload-input');
  const uploadPreview = document.getElementById('upload-preview');
  const previewImg    = document.getElementById('preview-img');
  const previewName   = document.getElementById('preview-name');
  const removeBtn     = document.getElementById('preview-remove');

  if (uploadZone && uploadInput) {
    // Click to pick file
    uploadZone.addEventListener('click', e => {
      if (!e.target.closest('#preview-remove')) uploadInput.click();
    });

    uploadInput.addEventListener('change', () => handleFiles(uploadInput.files));

    // Drag events
    ['dragenter', 'dragover'].forEach(evt =>
      uploadZone.addEventListener(evt, e => {
        e.preventDefault(); e.stopPropagation();
        uploadZone.classList.add('drag-over');
      })
    );
    ['dragleave', 'drop'].forEach(evt =>
      uploadZone.addEventListener(evt, e => {
        e.preventDefault(); e.stopPropagation();
        uploadZone.classList.remove('drag-over');
      })
    );
    uploadZone.addEventListener('drop', e => handleFiles(e.dataTransfer.files));

    function handleFiles(files) {
      if (!files || !files.length) return;
      const file = files[0];
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
      if (!allowed.includes(file.type)) {
        alert('Only images (JPG, PNG, WebP, GIF) and videos (MP4, WebM) are allowed.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be under 50 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        if (file.type.startsWith('image/')) {
          previewImg.src = ev.target.result;
          previewImg.style.display = 'block';
        } else {
          previewImg.style.display = 'none';
        }
        if (previewName) previewName.textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        if (uploadPreview) uploadPreview.classList.add('show');
      };
      reader.readAsDataURL(file);
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        uploadInput.value = '';
        if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
        if (uploadPreview) uploadPreview.classList.remove('show');
      });
    }
  }

  /* ── Slug Auto-Generate ───────────────────────────────── */
  const titleInput = document.getElementById('news-title');
  const slugInput  = document.getElementById('news-slug');
  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      slugInput.value = titleInput.value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 80);
      updateSeoPreview();
    });
  }

  /* ── SEO Preview Live Update ─────────────────────────── */
  const metaTitleInput = document.getElementById('meta-title');
  const metaDescInput  = document.getElementById('meta-desc');
  const seoTitle       = document.getElementById('seo-preview-title');
  const seoDesc        = document.getElementById('seo-preview-desc');
  const seoUrl         = document.getElementById('seo-preview-url');

  function updateSeoPreview() {
    if (seoTitle && metaTitleInput)
      seoTitle.textContent = metaTitleInput.value || titleInput?.value || 'Article Title';
    if (seoDesc && metaDescInput)
      seoDesc.textContent  = metaDescInput.value || 'Meta description will appear here…';
    if (seoUrl && slugInput)
      seoUrl.textContent   = `nexusnews.com › ${slugInput.value || 'article-slug'}`;
  }

  [metaTitleInput, metaDescInput].forEach(el => {
    if (el) el.addEventListener('input', updateSeoPreview);
  });
  updateSeoPreview();

  /* ── Publish Form ─────────────────────────────────────── */
  const publishBtn = document.getElementById('publish-btn');
  const draftBtn   = document.getElementById('draft-btn');

  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const title = document.getElementById('news-title')?.value.trim();
      if (!title) {
        alert('Please enter a news title before publishing.');
        document.getElementById('news-title')?.focus();
        return;
      }
      // Simulate publish
      publishBtn.textContent = '✓ Published!';
      publishBtn.style.background = '#2e7d32';
      publishBtn.disabled = true;
      setTimeout(() => {
        publishBtn.textContent = 'Publish Article';
        publishBtn.style.background = '';
        publishBtn.disabled = false;
      }, 3000);
    });
  }
  if (draftBtn) {
    draftBtn.addEventListener('click', () => {
      draftBtn.textContent = '✓ Saved as Draft';
      setTimeout(() => { draftBtn.textContent = 'Save as Draft'; }, 2000);
    });
  }

  /* ── Chart bar animation ─────────────────────────────── */
  const chartBars = document.querySelectorAll('.chart-bar');
  if (chartBars.length) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        chartBars.forEach(bar => {
          const h = bar.dataset.height || '50';
          bar.style.height = h + '%';
        });
        observer.disconnect();
      }
    });
    const chartWrap = document.querySelector('.chart-wrap');
    if (chartWrap) observer.observe(chartWrap);
    chartBars.forEach(b => { b.style.height = '0'; b.style.transition = 'height .6s ease'; });
  }

  /* ── Table row click → edit ──────────────────────────── */
  document.querySelectorAll('.admin-table tr[data-id]').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      window.location.href = 'add-news.html?id=' + row.dataset.id;
    });
  });

})();
