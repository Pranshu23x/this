# CodeOpti ⚡ - AI Code Optimizer & Complexity Analyzer

A powerful Chrome extension that analyzes code complexity and provides AI-powered optimization suggestions for developers.

## Features

### 🔍 **Code Analysis**
- **Time & Space Complexity Analysis** - Automatic detection of Big-O notation
- **Performance Metrics** - Best, average, and worst-case scenarios
- **Bottleneck Detection** - Identify performance issues in your code
- **Multi-language Support** - JavaScript, Python, Java, C++, TypeScript, Go

### ⚡ **AI-Powered Optimization**
- **Smart Code Suggestions** - AI-generated optimized code alternatives
- **Side-by-side Comparison** - View original vs optimized code
- **Detailed Change Explanations** - Understand why changes improve performance
- **Quality Score** - Get an overall code quality rating

### 📊 **Performance Visualization**
- **Interactive Charts** - Visual representation of algorithm performance
- **Runtime Growth Curves** - Compare complexity growth patterns
- **Performance Comparison** - Original vs optimized algorithm visualization

### 📋 **Export & Reporting**
- **Multiple Formats** - Export as Markdown, JSON, or PDF
- **Comprehensive Reports** - Complete analysis with code, metrics, and recommendations
- **Share Results** - Easy sharing of optimization insights

### 🎯 **Interview Mode**
- **DSA Problem Detection** - Specialized analysis for data structures & algorithms
- **Interview-ready Insights** - Focus on optimization techniques important for coding interviews
- **Best Practices** - Recommendations aligned with industry standards

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "CodeOpti"
3. Click "Add to Chrome"

### Manual Installation (Development)
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Quick Start

1. **Click the extension icon** in your Chrome toolbar
2. **Select your programming language** from the dropdown
3. **Paste or type your code** in the Monaco Editor
4. **Click "Analyze Code"** to get complexity analysis
5. **Click "Generate Optimized Code"** for AI suggestions
6. **Export your report** for future reference

## Configuration

### API Key Setup
1. Click the settings icon (⚙️) in the extension
2. Enter your Gemini API key for AI features
3. Choose your preferred export format
4. Select theme (Dark/Light)

### Getting a Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to the extension settings

## Usage Examples

### JavaScript Array Sorting
```javascript
// Original Code (O(n²))
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}
```

**Analysis Results:**
- Time Complexity: O(n²)
- Space Complexity: O(1)
- Quality Score: 65/100

**AI Optimization:** Suggests using built-in `sort()` method or implementing QuickSort for O(n log n) performance.

### Python Search Algorithm
```python
# Original Code (O(n))
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
```

**Analysis Results:**
- Time Complexity: O(n)
- Space Complexity: O(1)
- Suggestion: Use binary search for sorted arrays (O(log n))

## Features Deep Dive

### Monaco Editor Integration
- **Syntax Highlighting** - Professional code editing experience
- **Multi-language Support** - Automatic language detection
- **Error Highlighting** - Visual feedback for syntax issues
- **Code Folding** - Organize large code blocks

### Performance Charts
- **Real-time Visualization** - Interactive Chart.js graphs
- **Comparison Mode** - Side-by-side performance analysis
- **Growth Curves** - Visual representation of algorithm scaling
- **Export Graphs** - Save charts as images

### Export Options
- **Markdown Reports** - GitHub-compatible documentation
- **JSON Data** - Raw analysis data for integration
- **PDF Reports** - Professional formatting for presentations
- **HTML Reports** - Web-ready analysis results

## Technical Architecture

### Extension Structure
```
├── manifest.json          # Extension configuration
├── popup.html             # Main UI interface
├── popup.css              # Styling and themes
├── popup.js               # Main application logic
├── background.js          # Service worker
├── monaco-loader.js       # Code editor integration
├── analyzer.js            # Complexity analysis engine
├── optimizer.js           # AI optimization module
├── exporter.js            # Report generation
└── icons/                 # Extension icons
```

### Key Technologies
- **Manifest V3** - Latest Chrome extension standard
- **Monaco Editor** - VS Code-powered code editing
- **Chart.js** - Interactive performance visualizations
- **Gemini AI** - Google's language model for optimization
- **Chrome Storage API** - Settings and preferences persistence

## Privacy & Security

- **Local Processing** - Code analysis happens locally when possible
- **Secure API Calls** - All external requests use HTTPS
- **No Data Storage** - Your code is never permanently stored
- **API Key Encryption** - Secure storage of credentials
- **Permission Minimal** - Only requests necessary permissions

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/codeOpti/chrome-extension.git

# Navigate to project directory
cd chrome-extension

# Load in Chrome for testing
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the project folder
```

### Building for Production
```bash
# Minify and optimize for distribution
npm run build

# Generate extension package
npm run package
```

## Roadmap

### Version 2.0 (Coming Soon)
- [ ] Real-time collaboration features
- [ ] Integration with popular IDEs
- [ ] Advanced algorithm visualization
- [ ] Team workspace functionality
- [ ] Custom rule configuration

### Version 2.1
- [ ] Machine learning model training
- [ ] Enterprise features
- [ ] API for third-party integration
- [ ] Advanced security scanning
- [ ] Performance benchmarking

## Support

- **Documentation**: [docs.codeOpti.dev](https://docs.codeOpti.dev)
- **Issues**: [GitHub Issues](https://github.com/codeOpti/chrome-extension/issues)
- **Email**: support@codeOpti.dev
- **Discord**: [Join our community](https://discord.gg/codeOpti)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Monaco Editor** - Microsoft's excellent code editor
- **Chart.js** - Beautiful, responsive charts
- **Google Gemini** - Powerful AI for code optimization
- **Chrome Extensions** - Platform that makes this possible

---

**Made with ⚡ by developers, for developers**

[Website](https://codeOpti.dev) | [Chrome Web Store](https://chrome.google.com/webstore) | [GitHub](https://github.com/codeOpti)