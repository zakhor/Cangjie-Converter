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

        const codes = cangjieMap[char];
        results.push({
            character: char,
            cangjie: codes || null,
            found: !!codes
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
    // Cache results for expand/collapse functionality
    convertText.cachedResults = data.results;

    // Update stats
    totalCharsSpan.textContent = data.totalCharacters;
    foundCharsSpan.textContent = data.foundCount;
    notFoundCharsSpan.textContent = data.notFoundCount;
    statsSection.style.visibility = 'visible';

    // Clear previous results
    resultsDiv.innerHTML = '';

    // Create result rows
    data.results.forEach((result, index) => {
        if (result.found) {
            const variant = getVariantChar(result.character);

            if (variant) {
                // Has simplified/traditional variant - show both in 2 rows
                const simpCodes = cangjieMap[variant.simplified];
                const tradCodes = cangjieMap[variant.traditional];

                // Create group container
                const group = document.createElement('div');
                group.className = 'result-group';
                group.dataset.index = index;

                // Simplified row
                const simpRow = document.createElement('div');
                simpRow.className = 'result-row';

                const simpCharDiv = document.createElement('div');
                simpCharDiv.className = 'result-char';
                simpCharDiv.textContent = variant.simplified;
                simpRow.appendChild(simpCharDiv);

                // Simplified code (primary only)
                if (simpCodes && simpCodes.length > 0) {
                    const simpFormatted = formatCangjieCode(simpCodes[0]);

                    const simpCodeDiv = document.createElement('div');
                    simpCodeDiv.className = 'result-code';

                    const simpRadicalsDiv = document.createElement('div');
                    simpRadicalsDiv.className = 'result-code-radicals';
                    simpRadicalsDiv.textContent = simpFormatted.radicals;
                    simpCodeDiv.appendChild(simpRadicalsDiv);

                    const simpQwertyDiv = document.createElement('div');
                    simpQwertyDiv.className = 'result-code-qwerty';
                    simpQwertyDiv.textContent = simpFormatted.qwerty;

                    // Add asterisk if multiple codes exist
                    if (simpCodes.length > 1) {
                        const asterisk = createAsteriskWithTooltip(simpCodes);
                        simpQwertyDiv.appendChild(asterisk);
                    }

                    simpCodeDiv.appendChild(simpQwertyDiv);
                    simpRow.appendChild(simpCodeDiv);
                } else {
                    // Simplified code not found
                    const notFoundDiv = document.createElement('div');
                    notFoundDiv.className = 'result-code-notfound';
                    notFoundDiv.textContent = '未找到';
                    simpRow.appendChild(notFoundDiv);
                }

                group.appendChild(simpRow);

                // Traditional row
                const tradRow = document.createElement('div');
                tradRow.className = 'result-row';

                const tradCharDiv = document.createElement('div');
                tradCharDiv.className = 'result-char';
                tradCharDiv.textContent = variant.traditional;
                tradRow.appendChild(tradCharDiv);

                // Traditional code (primary only)
                if (tradCodes && tradCodes.length > 0) {
                    const tradFormatted = formatCangjieCode(tradCodes[0]);

                    const tradCodeDiv = document.createElement('div');
                    tradCodeDiv.className = 'result-code';

                    const tradRadicalsDiv = document.createElement('div');
                    tradRadicalsDiv.className = 'result-code-radicals';
                    tradRadicalsDiv.textContent = tradFormatted.radicals;
                    tradCodeDiv.appendChild(tradRadicalsDiv);

                    const tradQwertyDiv = document.createElement('div');
                    tradQwertyDiv.className = 'result-code-qwerty';
                    tradQwertyDiv.textContent = tradFormatted.qwerty;

                    // Add asterisk if multiple codes exist
                    if (tradCodes.length > 1) {
                        const asterisk = createAsteriskWithTooltip(tradCodes);
                        tradQwertyDiv.appendChild(asterisk);
                    }

                    tradCodeDiv.appendChild(tradQwertyDiv);
                    tradRow.appendChild(tradCodeDiv);
                } else {
                    // Traditional code not found
                    const notFoundDiv = document.createElement('div');
                    notFoundDiv.className = 'result-code-notfound';
                    notFoundDiv.textContent = '未找到';
                    tradRow.appendChild(notFoundDiv);
                }

                group.appendChild(tradRow);
                resultsDiv.appendChild(group);
            } else {
                // No variant - show single character in 1 row
                const row = document.createElement('div');
                row.className = 'result-row';
                row.dataset.index = index;

                const charDiv = document.createElement('div');
                charDiv.className = 'result-char';
                charDiv.textContent = result.character;
                row.appendChild(charDiv);

                const codes = result.cangjie;
                const formatted = formatCangjieCode(codes[0]);

                const codeDiv = document.createElement('div');
                codeDiv.className = 'result-code';

                const radicalsDiv = document.createElement('div');
                radicalsDiv.className = 'result-code-radicals';
                radicalsDiv.textContent = formatted.radicals;
                codeDiv.appendChild(radicalsDiv);

                const qwertyDiv = document.createElement('div');
                qwertyDiv.className = 'result-code-qwerty';
                qwertyDiv.textContent = formatted.qwerty;

                // Add asterisk if multiple codes exist
                if (codes.length > 1) {
                    const asterisk = createAsteriskWithTooltip(codes);
                    qwertyDiv.appendChild(asterisk);
                }

                codeDiv.appendChild(qwertyDiv);
                row.appendChild(codeDiv);

                resultsDiv.appendChild(row);
            }
        } else {
            // Character not found in Cangjie database
            const row = document.createElement('div');
            row.className = 'result-row';
            row.dataset.index = index;

            const charDiv = document.createElement('div');
            charDiv.className = 'result-char';
            charDiv.textContent = result.character;
            row.appendChild(charDiv);

            const notFoundDiv = document.createElement('div');
            notFoundDiv.className = 'result-code-notfound';
            notFoundDiv.textContent = '未找到';
            row.appendChild(notFoundDiv);
            row.style.background = '#FFE0E0';

            resultsDiv.appendChild(row);
        }
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

// Create asterisk with tooltip showing all Cangjie codes
function createAsteriskWithTooltip(codes) {
    const asterisk = document.createElement('span');
    asterisk.className = 'code-asterisk';
    asterisk.textContent = ' *';

    // Create tooltip content
    let tooltipText = '';
    for (let i = 0; i < codes.length; i++) {
        const formatted = formatCangjieCode(codes[i]);
        tooltipText += `${formatted.radicals} (${formatted.qwerty})`;
        if (i < codes.length - 1) {
            tooltipText += '\n';
        }
    }

    asterisk.setAttribute('title', tooltipText);

    return asterisk;
}
