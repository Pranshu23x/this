// Background script for CodeOpti Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CodeOpti Extension Installed');
  
  // Initialize default settings
  chrome.storage.sync.set({
    theme: 'dark',
    exportFormat: 'markdown',
    interviewMode: false,
    language: 'javascript'
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});

// Message handling for communication with popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeCode') {
    handleCodeAnalysis(request.code, request.language)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'optimizeCode') {
    handleCodeOptimization(request.code, request.language)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleCodeAnalysis(code, language) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured. Please add your Gemini API key in settings.');
  }
  
  const prompt = `
    Analyze the following ${language} code and provide:
    1. Time complexity in Big O notation
    2. Space complexity in Big O notation
    3. Detailed analysis of algorithm efficiency
    4. Identification of bottlenecks
    5. Best, average, and worst case scenarios
    
    Return the response as JSON in this format:
    {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "analysis": "Detailed analysis text",
      "bottlenecks": ["bottleneck1", "bottleneck2"],
      "bestCase": "O(1)",
      "averageCase": "O(n)",
      "worstCase": "O(n²)"
    }
    
    Code:
    ${code}
  `;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    
    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    try {
      return JSON.parse(result);
    } catch {
      // Fallback if JSON parsing fails
      return {
        timeComplexity: extractComplexity(result, 'time'),
        spaceComplexity: extractComplexity(result, 'space'),
        analysis: result,
        bottlenecks: [],
        bestCase: 'N/A',
        averageCase: 'N/A',
        worstCase: 'N/A'
      };
    }
  } catch (error) {
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

async function handleCodeOptimization(code, language) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured');
  }
  
  const prompt = `
    Optimize the following ${language} code and provide:
    1. Optimized version of the code
    2. List of changes made with explanations
    3. Performance improvements
    4. Code quality improvements
    
    Return as JSON:
    {
      "optimizedCode": "optimized code here",
      "changes": [
        {"line": 1, "change": "description", "reason": "explanation"}
      ],
      "improvements": "summary of improvements",
      "qualityScore": 85
    }
    
    Code:
    ${code}
  `;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    
    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    try {
      return JSON.parse(result);
    } catch {
      return {
        optimizedCode: result,
        changes: [],
        improvements: 'Code optimization completed',
        qualityScore: 75
      };
    }
  } catch (error) {
    throw new Error(`Optimization failed: ${error.message}`);
  }
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey'], (result) => {
      resolve(result.apiKey || 'AIzaSyBLNKMHRoIdbU6vz3n-D7YCWQs_undJLYU'); // fallback key
    });
  });
}

function extractComplexity(text, type) {
  const regex = new RegExp(`${type}\\s*complexity[:\\s]*([O]\\([^)]+\\))`, 'i');
  const match = text.match(regex);
  return match ? match[1] : 'O(?)';
}