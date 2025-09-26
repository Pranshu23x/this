// Monaco Editor Loader for CodeOpti Extension
class MonacoLoader {
  constructor() {
    this.editor = null;
    this.optimizedEditor = null;
    this.isLoaded = false;
  }

  async loadMonaco() {
    if (this.isLoaded) return;

    try {
      // Load Monaco Editor from CDN
      await this.loadScript('https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js');
      
      return new Promise((resolve) => {
        require.config({ 
          paths: { 
            vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' 
          } 
        });
        
        require(['vs/editor/editor.main'], () => {
          this.isLoaded = true;
          resolve();
        });
      });
    } catch (error) {
      console.error('Failed to load Monaco Editor:', error);
      // Fallback to textarea
      this.createFallbackEditor();
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async createEditor(containerId, language = 'javascript', value = '') {
    await this.loadMonaco();
    
    const container = document.getElementById(containerId);
    if (!container) return null;

    if (this.isLoaded && typeof monaco !== 'undefined') {
      const editor = monaco.editor.create(container, {
        value: value,
        language: language,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible'
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3
      });

      // Store reference based on container
      if (containerId === 'codeEditor') {
        this.editor = editor;
      } else if (containerId === 'optimizedCodeEditor') {
        this.optimizedEditor = editor;
      }

      return editor;
    } else {
      return this.createFallbackEditor(container, value);
    }
  }

  createFallbackEditor(container, value = '') {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.cssText = `
      width: 100%;
      height: 100%;
      background: #1e1e1e;
      color: #d4d4d4;
      border: none;
      outline: none;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      padding: 16px;
      resize: none;
      line-height: 1.5;
    `;
    
    container.innerHTML = '';
    container.appendChild(textarea);
    
    return {
      getValue: () => textarea.value,
      setValue: (val) => textarea.value = val,
      getModel: () => ({
        getLanguageId: () => 'javascript'
      })
    };
  }

  getValue(editorType = 'main') {
    const editor = editorType === 'main' ? this.editor : this.optimizedEditor;
    return editor ? editor.getValue() : '';
  }

  setValue(value, editorType = 'main') {
    const editor = editorType === 'main' ? this.editor : this.optimizedEditor;
    if (editor) {
      editor.setValue(value);
    }
  }

  setLanguage(language, editorType = 'main') {
    const editor = editorType === 'main' ? this.editor : this.optimizedEditor;
    if (editor && this.isLoaded && typeof monaco !== 'undefined') {
      const model = editor.getModel();
      monaco.editor.setModelLanguage(model, language);
    }
  }

  getLanguageMap() {
    return {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'go': 'go'
    };
  }
}

// Create global instance
window.monacoLoader = new MonacoLoader();