// Code Optimization Module for CodeOpti Extension
class CodeOptimizer {
  constructor() {
    this.currentOptimization = null;
    this.comparisonMode = 'original';
  }

  async optimizeCode(code, language) {
    if (!code.trim()) {
      throw new Error('Please provide code to optimize');
    }

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'optimizeCode',
          code: code,
          language: language
        }, resolve);
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      this.currentOptimization = response.data;
      return this.currentOptimization;
    } catch (error) {
      console.error('Optimization error:', error);
      throw error;
    }
  }

  updateOptimizationUI(optimization, originalCode) {
    const optimizedEditor = document.getElementById('optimizedCodeEditor');
    const suggestions = document.getElementById('optimizationSuggestions');

    // Update optimized code editor
    if (optimizedEditor && window.monacoLoader) {
      this.showComparison('optimized');
    }

    // Update suggestions
    if (suggestions) {
      suggestions.innerHTML = this.formatOptimizationSuggestions(optimization);
    }

    // Update quality score if available
    if (optimization.qualityScore) {
      this.updateQualityScore(optimization.qualityScore);
    }

    // Setup comparison tabs
    this.setupComparisonTabs(originalCode, optimization.optimizedCode);
  }

  formatOptimizationSuggestions(optimization) {
    let html = '<div class="optimization-breakdown">';
    
    if (optimization.improvements) {
      html += `<div class="improvements-section">`;
      html += `<h4>Performance Improvements:</h4>`;
      html += `<p>${optimization.improvements}</p>`;
      html += `</div>`;
    }

    if (optimization.changes && optimization.changes.length > 0) {
      html += '<div class="changes-section">';
      html += '<h4>Code Changes:</h4>';
      html += '<div class="changes-list">';
      
      optimization.changes.forEach(change => {
        html += `<div class="change-item">`;
        html += `<div class="change-header">`;
        html += `<span class="change-line">Line ${change.line}</span>`;
        html += `<span class="change-type">${change.change}</span>`;
        html += `</div>`;
        html += `<div class="change-reason">${change.reason}</div>`;
        html += `</div>`;
      });
      
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  setupComparisonTabs(originalCode, optimizedCode) {
    const tabs = document.querySelectorAll('.comparison-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-comparison');
        this.switchComparison(mode, originalCode, optimizedCode);
      });
    });
  }

  switchComparison(mode, originalCode, optimizedCode) {
    // Update active tab
    document.querySelectorAll('.comparison-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-comparison') === mode);
    });

    this.comparisonMode = mode;
    this.showComparison(mode, originalCode, optimizedCode);
  }

  async showComparison(mode, originalCode, optimizedCode) {
    const container = document.getElementById('optimizedCodeEditor');
    if (!container) return;

    let codeToShow = '';
    let isReadOnly = false;

    switch (mode) {
      case 'original':
        codeToShow = originalCode || '';
        isReadOnly = true;
        break;
      case 'optimized':
        codeToShow = optimizedCode || (this.currentOptimization?.optimizedCode || '');
        isReadOnly = true;
        break;
      case 'diff':
        codeToShow = this.generateDiff(originalCode, optimizedCode);
        isReadOnly = true;
        break;
    }

    // Create or update the optimized editor
    if (!window.monacoLoader.optimizedEditor) {
      await window.monacoLoader.createEditor('optimizedCodeEditor', 'javascript', codeToShow);
    } else {
      window.monacoLoader.setValue(codeToShow, 'optimized');
    }

    // Set read-only mode
    if (window.monacoLoader.optimizedEditor && typeof monaco !== 'undefined') {
      window.monacoLoader.optimizedEditor.updateOptions({ readOnly: isReadOnly });
    }
  }

  generateDiff(original, optimized) {
    if (!original || !optimized) {
      return 'No comparison available';
    }

    const originalLines = original.split('\n');
    const optimizedLines = optimized.split('\n');
    
    let diff = '// === CODE COMPARISON ===\n\n';
    diff += '// --- ORIGINAL ---\n';
    originalLines.forEach((line, i) => {
      diff += `// ${i + 1}: ${line}\n`;
    });
    
    diff += '\n// --- OPTIMIZED ---\n';
    optimizedLines.forEach((line, i) => {
      diff += `// ${i + 1}: ${line}\n`;
    });
    
    return diff;
  }

  updateQualityScore(score) {
    const scoreElement = document.getElementById('qualityScore');
    const qualityFeedback = document.getElementById('qualityFeedback');
    
    if (scoreElement) {
      scoreElement.textContent = score;
      
      // Update circle color based on score
      const circle = scoreElement.closest('.score-circle');
      if (circle) {
        let gradient;
        if (score >= 80) {
          gradient = 'conic-gradient(from 0deg, #10b981, #06b6d4, #10b981)';
        } else if (score >= 60) {
          gradient = 'conic-gradient(from 0deg, #f59e0b, #06b6d4, #f59e0b)';
        } else {
          gradient = 'conic-gradient(from 0deg, #ef4444, #06b6d4, #ef4444)';
        }
        circle.style.background = gradient;
      }
    }

    if (qualityFeedback) {
      qualityFeedback.innerHTML = this.generateQualityFeedback(score);
    }
  }

  generateQualityFeedback(score) {
    let feedback = '';
    
    if (score >= 90) {
      feedback = '<div class="quality-excellent">🎉 Excellent code quality! Your code follows best practices and is highly optimized.</div>';
    } else if (score >= 80) {
      feedback = '<div class="quality-good">✅ Good code quality. Minor improvements could be made for better performance.</div>';
    } else if (score >= 60) {
      feedback = '<div class="quality-average">⚠️ Average code quality. Consider the optimization suggestions to improve performance and readability.</div>';
    } else {
      feedback = '<div class="quality-poor">❌ Code quality needs improvement. Please review the optimization suggestions for better practices.</div>';
    }
    
    // Add specific recommendations based on score
    feedback += '<div class="quality-recommendations">';
    feedback += '<h4>Recommendations:</h4>';
    feedback += '<ul>';
    
    if (score < 70) {
      feedback += '<li>Consider using more efficient algorithms</li>';
      feedback += '<li>Optimize nested loops and recursive calls</li>';
    }
    
    if (score < 80) {
      feedback += '<li>Improve variable naming and code structure</li>';
      feedback += '<li>Add proper error handling</li>';
    }
    
    if (score < 90) {
      feedback += '<li>Consider edge cases and input validation</li>';
      feedback += '<li>Add meaningful comments for complex logic</li>';
    }
    
    feedback += '</ul>';
    feedback += '</div>';
    
    return feedback;
  }

  getOptimizationSummary() {
    if (!this.currentOptimization) {
      return 'No optimization data available';
    }

    let summary = '# Code Optimization Report\n\n';
    
    if (this.currentOptimization.improvements) {
      summary += `## Improvements\n${this.currentOptimization.improvements}\n\n`;
    }
    
    if (this.currentOptimization.qualityScore) {
      summary += `## Quality Score: ${this.currentOptimization.qualityScore}/100\n\n`;
    }
    
    if (this.currentOptimization.changes && this.currentOptimization.changes.length > 0) {
      summary += '## Changes Made\n';
      this.currentOptimization.changes.forEach((change, index) => {
        summary += `${index + 1}. **Line ${change.line}**: ${change.change}\n`;
        summary += `   - Reason: ${change.reason}\n\n`;
      });
    }
    
    summary += '## Optimized Code\n```\n';
    summary += this.currentOptimization.optimizedCode || 'No optimized code available';
    summary += '\n```\n';
    
    return summary;
  }
}

// Create global instance
window.codeOptimizer = new CodeOptimizer();