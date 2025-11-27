// Global variables to store Cangjie data and conversion map
let cangjieMap = null;
let simplifiedTraditionalMap = null;

// Cangjie radical mapping (QWERTY to Chinese radicals)
const CANGJIE_RADICALS = {
  'q': '手', 'w': '田', 'e': '水', 'r': '口', 't': '廿',
  'y': '卜', 'u': '山', 'i': '戈', 'o': '人', 'p': '心',
  'a': '日', 's': '尸', 'd': '木', 'f': '火', 'g': '土',
  'h': '竹', 'j': '十', 'k': '大', 'l': '中', 'z': '我',
  'x': '難', 'c': '金', 'v': '女', 'b': '月', 'n': '弓',
  'm': '一'
};

// Convert QWERTY code to radical display format
function formatCangjieCode(qwertyCode) {
  const radicals = qwertyCode.split('').map(char => CANGJIE_RADICALS[char] || char).join('');
  return {
    radicals: radicals,
    qwerty: qwertyCode
  };
}

// DOM elements
const inputText = document.getElementById('inputText');
const clearBtn = document.getElementById('clearBtn');
const resultsDiv = document.getElementById('results');
const statsSection = document.getElementById('statsSection');
const totalCharsSpan = document.getElementById('totalChars');
const foundCharsSpan = document.getElementById('foundChars');
const notFoundCharsSpan = document.getElementById('notFoundChars');

// Load Cangjie data on page load
async function loadCangjieData() {
    try {
        const response = await fetch('data/cangjie5.json');
        if (!response.ok) {
            throw new Error('Failed to load Cangjie data');
        }
        cangjieMap = await response.json();
        console.log(`Loaded ${Object.keys(cangjieMap).length} character mappings`);
    } catch (error) {
        console.error('Error loading Cangjie data:', error);
        alert('無法載入倉頡碼資料庫，請重新整理頁面');
    }
}

// Load simplified-traditional conversion map
async function loadConversionData() {
    try {
        const response = await fetch('data/simplified-traditional.json');
        if (!response.ok) {
            throw new Error('Failed to load conversion data');
        }
        simplifiedTraditionalMap = await response.json();
        console.log(`Loaded ${Object.keys(simplifiedTraditionalMap.s2t).length} S→T and ${Object.keys(simplifiedTraditionalMap.t2s).length} T→S mappings`);
    } catch (error) {
        console.error('Error loading conversion data:', error);
        // Don't alert - this is optional, will fallback to single character display
    }
}

// Get variant character (simplified/traditional)
function getVariantChar(char) {
    if (!simplifiedTraditionalMap) return null;

    // Check simplified -> traditional
    if (simplifiedTraditionalMap.s2t[char]) {
        return {
            simplified: char,
            traditional: simplifiedTraditionalMap.s2t[char]
        };
    }

    // Check traditional -> simplified
    if (simplifiedTraditionalMap.t2s[char]) {
        return {
            simplified: simplifiedTraditionalMap.t2s[char],
            traditional: char
        };
    }

    // No variant found
    return null;
}

// Call on page load
loadCangjieData();
loadConversionData();

// Event listeners
clearBtn.addEventListener('click', clearAll);

// Real-time search on input
inputText.addEventListener('input', () => {
    const text = inputText.value.trim();
    if (text) {
        convertText();
    } else {
        // Clear results if input is empty
        resultsDiv.innerHTML = '';
        statsSection.style.visibility = 'hidden';
    }
});

// Convert text to Cangjie codes
function convertText() {
    const text = inputText.value.trim();

    if (!text) {
        alert('請輸入至少一個漢字');
        return;
    }

    // Check if data is loaded
    if (!cangjieMap) {
        alert('倉頡碼資料庫尚未載入完成，請稍後再試');
        return;
    }

    // Process characters locally
    const results = [];
    for (const char of text) {
        // Skip whitespace
        if (char.trim() === '') {
            continue;
        }

        const code = cangjieMap[char];
        results.push({
            character: char,
            cangjie: code || null,
            found: !!code
        });
    }

    // Create data object matching old API format
    const data = {
        results: results,
        totalCharacters: results.length,
        foundCount: results.filter(r => r.found).length,
        notFoundCount: results.filter(r => !r.found).length
    };

    displayResults(data);
}

// Display results
function displayResults(data) {
    // Update stats
    totalCharsSpan.textContent = data.totalCharacters;
    foundCharsSpan.textContent = data.foundCount;
    notFoundCharsSpan.textContent = data.notFoundCount;
    statsSection.style.visibility = 'visible';

    // Clear previous results
    resultsDiv.innerHTML = '';

    // Create result rows
    data.results.forEach(result => {
        const row = document.createElement('div');
        row.className = 'result-row';

        if (result.found) {
            const variant = getVariantChar(result.character);

            if (variant) {
                // Has simplified/traditional variant - show both
                const simpCode = cangjieMap[variant.simplified];
                const tradCode = cangjieMap[variant.traditional];

                // Simplified character
                const simpCharDiv = document.createElement('div');
                simpCharDiv.className = 'result-char-simplified';
                simpCharDiv.textContent = variant.simplified;
                row.appendChild(simpCharDiv);

                // Simplified code
                if (simpCode) {
                    const simpFormatted = formatCangjieCode(simpCode);
                    const simpRadicalsDiv = document.createElement('div');
                    simpRadicalsDiv.className = 'result-code-radicals';
                    simpRadicalsDiv.textContent = simpFormatted.radicals;
                    row.appendChild(simpRadicalsDiv);

                    const simpQwertyDiv = document.createElement('div');
                    simpQwertyDiv.className = 'result-code-qwerty';
                    simpQwertyDiv.textContent = simpFormatted.qwerty;
                    row.appendChild(simpQwertyDiv);
                } else {
                    // Simplified code not found
                    const notFoundDiv = document.createElement('div');
                    notFoundDiv.className = 'result-code-notfound';
                    notFoundDiv.textContent = '未找到';
                    row.appendChild(notFoundDiv);
                }

                // Traditional character
                const tradCharDiv = document.createElement('div');
                tradCharDiv.className = 'result-char-traditional';
                tradCharDiv.textContent = variant.traditional;
                row.appendChild(tradCharDiv);

                // Traditional code
                if (tradCode) {
                    const tradFormatted = formatCangjieCode(tradCode);
                    const tradRadicalsDiv = document.createElement('div');
                    tradRadicalsDiv.className = 'result-code-radicals';
                    tradRadicalsDiv.textContent = tradFormatted.radicals;
                    row.appendChild(tradRadicalsDiv);

                    const tradQwertyDiv = document.createElement('div');
                    tradQwertyDiv.className = 'result-code-qwerty';
                    tradQwertyDiv.textContent = tradFormatted.qwerty;
                    row.appendChild(tradQwertyDiv);
                } else {
                    // Traditional code not found
                    const notFoundDiv = document.createElement('div');
                    notFoundDiv.className = 'result-code-notfound';
                    notFoundDiv.textContent = '未找到';
                    row.appendChild(notFoundDiv);
                }
            } else {
                // No variant - show single character (original behavior)
                const charDiv = document.createElement('div');
                charDiv.className = 'result-char';
                charDiv.textContent = result.character;
                row.appendChild(charDiv);

                const formatted = formatCangjieCode(result.cangjie);

                const radicalsDiv = document.createElement('div');
                radicalsDiv.className = 'result-code-radicals';
                radicalsDiv.textContent = formatted.radicals;
                row.appendChild(radicalsDiv);

                const qwertyDiv = document.createElement('div');
                qwertyDiv.className = 'result-code-qwerty';
                qwertyDiv.textContent = formatted.qwerty;
                row.appendChild(qwertyDiv);

                // Add empty spacer to fill remaining 50%
                const spacerDiv = document.createElement('div');
                spacerDiv.className = 'result-code-spacer';
                row.appendChild(spacerDiv);
            }
        } else {
            // Character not found in Cangjie database
            const charDiv = document.createElement('div');
            charDiv.className = 'result-char';
            charDiv.textContent = result.character;
            row.appendChild(charDiv);

            const notFoundDiv = document.createElement('div');
            notFoundDiv.style.flex = '1';
            notFoundDiv.style.padding = '10px';
            notFoundDiv.style.display = 'flex';
            notFoundDiv.style.alignItems = 'center';
            notFoundDiv.style.justifyContent = 'center';
            notFoundDiv.textContent = '未找到';
            row.appendChild(notFoundDiv);
            row.style.background = '#FFE0E0';
        }

        resultsDiv.appendChild(row);
    });

    // Auto-scroll to bottom after adding new results
    resultsDiv.scrollTop = resultsDiv.scrollHeight;
}

// Clear all
function clearAll() {
    inputText.value = '';
    resultsDiv.innerHTML = '';
    statsSection.style.visibility = 'hidden';
    inputText.focus();
}
