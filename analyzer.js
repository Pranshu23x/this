// Code Analysis Module for CodeOpti Extension
class CodeAnalyzer {
  constructor() {
    this.currentAnalysis = null;
    this.performanceChart = null;
  }

  async analyzeCode(code, language) {
    if (!code.trim()) {
      throw new Error('Please provide code to analyze');
    }

    try {
      // Send message to background script for analysis
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'analyzeCode',
          code: code,
          language: language
        }, resolve);
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      this.currentAnalysis = response.data;
      return this.currentAnalysis;
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  updateAnalysisUI(analysis) {
    // Update complexity displays
    const timeComplexity = document.getElementById('timeComplexity');
    const spaceComplexity = document.getElementById('spaceComplexity');
    const analysisDetails = document.getElementById('analysisDetails');

    if (timeComplexity) {
      timeComplexity.textContent = analysis.timeComplexity || 'O(?)';
    }

    if (spaceComplexity) {
      spaceComplexity.textContent = analysis.spaceComplexity || 'O(?)';
    }

    if (analysisDetails) {
      analysisDetails.innerHTML = this.formatAnalysisDetails(analysis);
    }

    // Update performance metrics
    this.updatePerformanceMetrics(analysis);
    this.createPerformanceChart(analysis);
  }

  formatAnalysisDetails(analysis) {
    let html = '<div class="analysis-breakdown">';
    
    if (analysis.analysis) {
      html += `<div class="analysis-text">${analysis.analysis}</div>`;
    }

    if (analysis.bottlenecks && analysis.bottlenecks.length > 0) {
      html += '<div class="bottlenecks-section">';
      html += '<h4>Identified Bottlenecks:</h4>';
      html += '<ul>';
      analysis.bottlenecks.forEach(bottleneck => {
        html += `<li>${bottleneck}</li>`;
      });
      html += '</ul>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  updatePerformanceMetrics(analysis) {
    const bestCase = document.getElementById('bestCase');
    const averageCase = document.getElementById('averageCase');
    const worstCase = document.getElementById('worstCase');

    if (bestCase) bestCase.textContent = analysis.bestCase || 'N/A';
    if (averageCase) averageCase.textContent = analysis.averageCase || 'N/A';
    if (worstCase) worstCase.textContent = analysis.worstCase || 'N/A';
  }

  createPerformanceChart(analysis) {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (this.performanceChart) {
      this.performanceChart.destroy();
    }

    // Generate sample data based on complexity
    const complexityData = this.generateComplexityData(analysis.timeComplexity);

    this.performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['10', '50', '100', '500', '1K', '5K', '10K'],
        datasets: [{
          label: 'Current Algorithm',
          data: complexityData.current,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderWidth: 2,
          tension: 0.4
        }, {
          label: 'Optimal (Linear)',
          data: complexityData.optimal,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#e2e8f0',
              font: { size: 12 }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Input Size (n)',
              color: '#94a3b8'
            },
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y: {
            title: {
              display: true,
              text: 'Operations',
              color: '#94a3b8'
            },
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          }
        }
      }
    });
  }

  generateComplexityData(complexity) {
    const sizes = [10, 50, 100, 500, 1000, 5000, 10000];
    const current = [];
    const optimal = [];

    sizes.forEach(n => {
      // Generate data based on complexity
      let value;
      switch (complexity) {
        case 'O(1)':
          value = 1;
          break;
        case 'O(log n)':
          value = Math.log2(n);
          break;
        case 'O(n)':
          value = n;
          break;
        case 'O(n log n)':
          value = n * Math.log2(n);
          break;
        case 'O(n²)':
          value = n * n;
          break;
        case 'O(n³)':
          value = n * n * n;
          break;
        case 'O(2^n)':
          value = Math.pow(2, Math.min(n, 20)); // Cap for visualization
          break;
        default:
          value = n;
      }
      
      current.push(Math.max(1, value / 100)); // Scale for visualization
      optimal.push(n / 100); // Linear reference
    });

    return { current, optimal };
  }

  detectLanguage(code) {
    // Simple language detection based on syntax patterns
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
      return 'python';
    } else if (code.includes('public class') || code.includes('System.out')) {
      return 'java';
    } else if (code.includes('#include') || code.includes('cout <<')) {
      return 'cpp';
    } else if (code.includes('func ') || code.includes('package ')) {
      return 'go';
    } else if (code.includes('interface ') && code.includes(': ')) {
      return 'typescript';
    } else {
      return 'javascript';
    }
  }

  exportAnalysis(format = 'markdown') {
    if (!this.currentAnalysis) {
      throw new Error('No analysis data available');
    }

    switch (format) {
      case 'markdown':
        return this.exportAsMarkdown();
      case 'json':
        return this.exportAsJSON();
      default:
        return this.exportAsMarkdown();
    }
  }

  exportAsMarkdown() {
    const analysis = this.currentAnalysis;
    let markdown = `# Code Analysis Report\n\n`;
    
    markdown += `## Complexity Analysis\n`;
    markdown += `- **Time Complexity:** ${analysis.timeComplexity}\n`;
    markdown += `- **Space Complexity:** ${analysis.spaceComplexity}\n\n`;
    
    markdown += `## Performance Metrics\n`;
    markdown += `- **Best Case:** ${analysis.bestCase}\n`;
    markdown += `- **Average Case:** ${analysis.averageCase}\n`;
    markdown += `- **Worst Case:** ${analysis.worstCase}\n\n`;
    
    if (analysis.analysis) {
      markdown += `## Detailed Analysis\n${analysis.analysis}\n\n`;
    }
    
    if (analysis.bottlenecks && analysis.bottlenecks.length > 0) {
      markdown += `## Identified Bottlenecks\n`;
      analysis.bottlenecks.forEach(bottleneck => {
        markdown += `- ${bottleneck}\n`;
      });
      markdown += '\n';
    }
    
    markdown += `---\n*Generated by CodeOpti ⚡*\n`;
    
    return markdown;
  }

  exportAsJSON() {
    return JSON.stringify(this.currentAnalysis, null, 2);
  }
}

// Create global instance
window.codeAnalyzer = new CodeAnalyzer();