// Rich Text Editor initialization using Quill.js
document.addEventListener('DOMContentLoaded', function() {
  // Wait for emoji picker to be defined
  customElements.whenDefined('emoji-picker').then(() => {
    initializeAllEditors();
  }).catch(() => {
    // Fallback if emoji picker doesn't load
    setTimeout(initializeAllEditors, 500);
  });
});

function initializeAllEditors() {
  // Initialize blog content editor
  const blogContentTextarea = document.querySelector('textarea[name="content"]');
  if (blogContentTextarea && blogContentTextarea.closest('form')) {
    initializeEditor(blogContentTextarea, {
      placeholder: 'Write your blog content here...',
      minHeight: '300px'
    });
  }

  // Initialize video description editor
  const videoDescriptionTextarea = document.querySelector('textarea[name="description"]');
  if (videoDescriptionTextarea && videoDescriptionTextarea.closest('form[action*="videos"]')) {
    initializeEditor(videoDescriptionTextarea, {
      placeholder: 'Write video description...',
      minHeight: '200px'
    });
  }

  // Initialize comment message editors
  const commentMessageTextareas = document.querySelectorAll('textarea[name="message"]');
  commentMessageTextareas.forEach(textarea => {
    initializeEditor(textarea, {
      placeholder: 'Write your comment...',
      minHeight: '120px',
      toolbar: [
        ['bold', 'italic', 'underline'],
        ['emoji'],
        ['link'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
      ]
    });
  });
}

let turndownServiceInstance = null;

function getTurndownService() {
  if (!window.TurndownService) return null;
  if (turndownServiceInstance) return turndownServiceInstance;

  const service = new window.TurndownService({
    codeBlockStyle: 'fenced',
    headingStyle: 'atx',
    bulletListMarker: '-',
  });

  service.addRule('keepAlignment', {
    filter: function(node) {
      if (!node.classList) return false;
      return Array.from(node.classList).some((cls) => cls.startsWith('ql-align-'));
    },
    replacement: function(content, node) {
      const className = Array.from(node.classList).find((cls) => cls.startsWith('ql-align-'));
      const tagName = node.tagName.toLowerCase();
      return `\n<${tagName} class="${className}">${node.innerHTML}</${tagName}>\n`;
    },
  });

  turndownServiceInstance = service;
  return turndownServiceInstance;
}

function markdownToHtml(markdown) {
  if (!markdown) return '';
  if (window.marked && typeof window.marked.parse === 'function') {
    return window.marked.parse(markdown);
  }
  return markdown;
}

function htmlToMarkdown(html) {
  const service = getTurndownService();
  if (!service) return html || '';
  return service.turndown(html || '');
}

/**
 * Initialize Quill editor for a textarea
 * @param {HTMLTextAreaElement} textarea - The textarea to replace with Quill
 * @param {Object} options - Configuration options
 */
function initializeEditor(textarea, options = {}) {
  const defaultOptions = {
    placeholder: 'Write something...',
    minHeight: '150px',
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['emoji'],
      ['link', 'image'],
      ['clean']
    ]
  };

  const config = { ...defaultOptions, ...options };

  // Create editor container
  const editorContainer = document.createElement('div');
  editorContainer.style.minHeight = config.minHeight;
  
  // Hide textarea and insert editor
  textarea.style.display = 'none';
  textarea.parentNode.insertBefore(editorContainer, textarea);

  // Initialize Quill
  const quill = new Quill(editorContainer, {
    theme: 'snow',
    placeholder: config.placeholder,
    modules: {
      toolbar: {
        container: config.toolbar,
        handlers: {
          emoji: function() {
            showEmojiPicker(quill);
          }
        }
      }
    }
  });

  // Add custom emoji button icon
  const emojiButton = editorContainer.querySelector('.ql-emoji');
  if (emojiButton) {
    emojiButton.innerHTML = '😀';
    emojiButton.style.width = 'auto';
    emojiButton.style.padding = '3px 5px';
    emojiButton.title = 'Insert Emoji';
  }

  // Set initial content from textarea
  if (textarea.value) {
    quill.root.innerHTML = markdownToHtml(textarea.value);
  }

  // Sync editor content back to textarea on change
  quill.on('text-change', function() {
    textarea.value = htmlToMarkdown(quill.root.innerHTML);
  });

  // Sync on form submit to ensure latest content is captured
  const form = textarea.closest('form');
  if (form) {
    form.addEventListener('submit', function() {
      textarea.value = htmlToMarkdown(quill.root.innerHTML);
    });
  }

  return quill;
}

/**
 * Show emoji picker modal
 */
function showEmojiPicker(quill) {
  // Check if picker already exists
  let pickerModal = document.getElementById('emoji-picker-modal');
  
  if (!pickerModal) {
    // Create modal backdrop
    pickerModal = document.createElement('div');
    pickerModal.id = 'emoji-picker-modal';
    pickerModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    // Create picker container
    const pickerContainer = document.createElement('div');
    pickerContainer.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕ Close';
    closeButton.className = 'btn btn-sm btn-secondary mb-2';
    closeButton.style.cssText = 'float: right;';
    
    // Create emoji picker
    const picker = document.createElement('emoji-picker');
    picker.className = 'light';
    
    pickerContainer.appendChild(closeButton);
    pickerContainer.appendChild(picker);
    pickerModal.appendChild(pickerContainer);
    document.body.appendChild(pickerModal);
    
    // Close on backdrop click
    pickerModal.addEventListener('click', function(e) {
      if (e.target === pickerModal) {
        pickerModal.style.display = 'none';
      }
    });
    
    // Close button handler
    closeButton.addEventListener('click', function() {
      pickerModal.style.display = 'none';
    });
    
    // Emoji selection handler
    picker.addEventListener('emoji-click', function(event) {
      const emoji = event.detail.unicode;
      const range = quill.getSelection(true);
      quill.insertText(range.index, emoji);
      quill.setSelection(range.index + emoji.length);
      pickerModal.style.display = 'none';
    });
  }
  
  // Show the modal
  pickerModal.style.display = 'flex';
}
