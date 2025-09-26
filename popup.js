// Main popup script for CodeOpti Extension
document.addEventListener('DOMContentLoaded', async () => {
  console.log('CodeOpti Extension loaded');

  // Initialize components
  await initializeExtension();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load user settings
  await loadUserSettings();

  // Initialize Monaco Editor
  await initializeEditor();
});

async function initializeExtension() {
  console.log('Initializing CodeOpti...');
  
  // Show loading state
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 1000);
  }
}

function setupEventListeners() {
  // Tab navigation
  setupTabNavigation();
  
  // Button event listeners
  setupButtonListeners();
  
  // Settings modal
  setupSettingsModal();
  
  // Language selector
  setupLanguageSelector();
}

function setupTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update active tab
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active panel
      tabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.getAttribute('data-panel') === targetTab);
      });
      
      // Handle tab-specific logic
      handleTabChange(targetTab);
    });
  });
}

function handleTabChange(tab) {
  switch (tab) {
    case 'performance':
      // Refresh chart if needed
      if (window.codeAnalyzer.currentAnalysis) {
        window.codeAnalyzer.createPerformanceChart(window.codeAnalyzer.currentAnalysis);
      }
      break;
    case 'optimize':
      // Initialize optimized editor if needed
      initializeOptimizedEditor();
      break;
  }
}

function setupButtonListeners() {
  // Analyze button
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalyzeCode);
  }

  // Optimize button
  const optimizeBtn = document.getElementById('optimizeBtn');
  if (optimizeBtn) {
    optimizeBtn.addEventListener('click', handleOptimizeCode);
  }

  // Clear button
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearCode);
  }

  // Export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportReport);
  }

  // Settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      document.getElementById('settingsModal').classList.remove('hidden');
    });
  }
}

function setupSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const closeBtn = document.getElementById('closeSettings');
  const saveBtn = document.getElementById('saveSettings');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveSettings);
  }

  // Close on backdrop click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}

function setupLanguageSelector() {
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      const language = e.target.value;
      
      // Update editor language
      if (window.monacoLoader) {
        window.monacoLoader.setLanguage(language);
      }
      
      // Update file name display
      updateFileName(language);
      
      // Save preference
      chrome.storage.sync.set({ language });
    });
  }
}

function updateFileName(language) {
  const fileNameElement = document.querySelector('.file-name');
  if (fileNameElement) {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      go: 'go'
    };
    fileNameElement.textContent = `main.${extensions[language] || 'txt'}`;
  }
}

async function initializeEditor() {
  try {
    // Initialize main editor
    await window.monacoLoader.createEditor('codeEditor', 'javascript', getDefaultCode());
    console.log('Monaco Editor initialized');
  } catch (error) {
    console.error('Failed to initialize Monaco Editor:', error);
    // Fallback handled in monaco-loader.js
  }
}

async function initializeOptimizedEditor() {
  if (!window.monacoLoader.optimizedEditor) {
    try {
      await window.monacoLoader.createEditor('optimizedCodeEditor', 'javascript', '// Optimized code will appear here');
    } catch (error) {
      console.error('Failed to initialize optimized editor:', error);
    }
  }
}

function getDefaultCode() {
  return `// Welcome to CodeOpti ⚡
// Paste your code here for analysis and optimization

function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}

// Try analyzing this code to see complexity analysis!`;
}

async function handleAnalyzeCode() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  
  try {
    // Show loading
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    loadingOverlay?.classList.remove('hidden');
    
    // Get code and language
    const code = window.monacoLoader.getValue();
    const language = document.getElementById('languageSelect')?.value || 'javascript';
    
    if (!code.trim()) {
      throw new Error('Please enter some code to analyze');
    }
    
    // Perform analysis
    const analysis = await window.codeAnalyzer.analyzeCode(code, language);
    
    // Update UI
    window.codeAnalyzer.updateAnalysisUI(analysis);
    
    // Switch to analysis tab
    document.querySelector('.tab-btn[data-tab="analysis"]')?.click();
    
    console.log('Analysis completed:', analysis);
    
  } catch (error) {
    console.error('Analysis failed:', error);
    showNotification(`Analysis failed: ${error.message}`, 'error');
  } finally {
    // Hide loading
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze Code';
    loadingOverlay?.classList.add('hidden');
  }
}

async function handleOptimizeCode() {
  const optimizeBtn = document.getElementById('optimizeBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  
  try {
    // Show loading
    optimizeBtn.disabled = true;
    optimizeBtn.textContent = 'Optimizing...';
    loadingOverlay?.classList.remove('hidden');
    
    // Get code and language
    const code = window.monacoLoader.getValue();
    const language = document.getElementById('languageSelect')?.value || 'javascript';
    
    if (!code.trim()) {
      throw new Error('Please enter some code to optimize');
    }
    
    // Perform optimization
    const optimization = await window.codeOptimizer.optimizeCode(code, language);
    
    // Update UI
    window.codeOptimizer.updateOptimizationUI(optimization, code);
    
    console.log('Optimization completed:', optimization);
    
  } catch (error) {
    console.error('Optimization failed:', error);
    showNotification(`Optimization failed: ${error.message}`, 'error');
  } finally {
    // Hide loading
    optimizeBtn.disabled = false;
    optimizeBtn.textContent = 'Generate Optimized Code';
    loadingOverlay?.classList.add('hidden');
  }
}

function handleClearCode() {
  if (confirm('Are you sure you want to clear all code?')) {
    window.monacoLoader.setValue('', 'main');
    window.monacoLoader.setValue('', 'optimized');
    
    // Reset analysis data
    window.codeAnalyzer.currentAnalysis = null;
    window.codeOptimizer.currentOptimization = null;
    
    // Reset UI
    resetAnalysisUI();
    
    showNotification('Code cleared successfully', 'success');
  }
}

function resetAnalysisUI() {
  // Reset complexity displays
  document.getElementById('timeComplexity').textContent = '-';
  document.getElementById('spaceComplexity').textContent = '-';
  document.getElementById('analysisDetails').textContent = 'Click "Analyze Code" to see detailed complexity analysis';
  
  // Reset performance metrics
  document.getElementById('bestCase').textContent = '-';
  document.getElementById('averageCase').textContent = '-';
  document.getElementById('worstCase').textContent = '-';
  
  // Reset quality score
  document.getElementById('qualityScore').textContent = '-';
  document.getElementById('qualityFeedback').textContent = 'Analyze your code to receive quality recommendations';
  
  // Reset optimization suggestions
  document.getElementById('optimizationSuggestions').textContent = 'Click "Generate Optimized Code" to see AI suggestions';
}

async function handleExportReport() {
  try {
    const format = document.getElementById('exportFormat')?.value || 'markdown';
    
    if (!window.codeAnalyzer.currentAnalysis && !window.codeOptimizer.currentOptimization) {
      throw new Error('No analysis data to export. Please analyze your code first.');
    }
    
    const content = await window.reportExporter.exportReport(format);
    const filename = window.reportExporter.getFileName(format);
    
    await window.reportExporter.downloadFile(content, filename, getContentType(format));
    
    showNotification('Report exported successfully!', 'success');
    
  } catch (error) {
    console.error('Export failed:', error);
    showNotification(`Export failed: ${error.message}`, 'error');
  }
}

function getContentType(format) {
  switch (format) {
    case 'markdown': return 'text/markdown';
    case 'json': return 'application/json';
    case 'pdf': return 'text/html';
    default: return 'text/plain';
  }
}

async function handleSaveSettings() {
  try {
    const theme = document.getElementById('themeSelect')?.value;
    const apiKey = document.getElementById('apiKeyInput')?.value;
    const exportFormat = document.getElementById('exportFormat')?.value;
    
    const settings = { theme, exportFormat };
    
    if (apiKey) {
      settings.apiKey = apiKey;
    }
    
    await chrome.storage.sync.set(settings);
    
    // Apply theme immediately
    if (theme) {
      applyTheme(theme);
    }
    
    document.getElementById('settingsModal').classList.add('hidden');
    showNotification('Settings saved successfully!', 'success');
    
  } catch (error) {
    console.error('Failed to save settings:', error);
    showNotification('Failed to save settings', 'error');
  }
}

async function loadUserSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'theme', 'apiKey', 'exportFormat', 'language', 'interviewMode'
    ]);
    
    // Apply saved settings to UI
    if (settings.theme) {
      document.getElementById('themeSelect').value = settings.theme;
      applyTheme(settings.theme);
    }
    
    if (settings.exportFormat) {
      document.getElementById('exportFormat').value = settings.exportFormat;
    }
    
    if (settings.language) {
      document.getElementById('languageSelect').value = settings.language;
      updateFileName(settings.language);
    }
    
    if (settings.interviewMode) {
      document.getElementById('interviewMode').checked = settings.interviewMode;
    }
    
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  
  // Update Monaco Editor theme if loaded
  if (typeof monaco !== 'undefined') {
    const monacoTheme = theme === 'light' ? 'vs' : 'vs-dark';
    monaco.editor.setTheme(monacoTheme);
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style the notification
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '6px',
    color: 'white',
    fontWeight: '500',
    fontSize: '14px',
    zIndex: '10000',
    minWidth: '200px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#06b6d4',
    animation: 'slideIn 0.3s ease'
  });
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);