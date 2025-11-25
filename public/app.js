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
  return `${radicals} (${qwertyCode})`;
}

// DOM elements
const inputText = document.getElementById('inputText');
const clearBtn = document.getElementById('clearBtn');
const resultsDiv = document.getElementById('results');
const statsSection = document.getElementById('statsSection');
const totalCharsSpan = document.getElementById('totalChars');
const foundCharsSpan = document.getElementById('foundChars');
const notFoundCharsSpan = document.getElementById('notFoundChars');

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
async function convertText() {
    const text = inputText.value.trim();

    if (!text) {
        alert('請輸入至少一個漢字');
        return;
    }

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error('查詢失敗');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        alert('查詢時發生錯誤，請稍後再試');
    }
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

        const charDiv = document.createElement('div');
        charDiv.className = 'result-char';
        charDiv.textContent = result.character;

        const codeDiv = document.createElement('div');
        codeDiv.className = 'result-code';
        if (result.found) {
            codeDiv.textContent = formatCangjieCode(result.cangjie);
        } else {
            codeDiv.textContent = '未找到';
            row.style.background = '#FFE0E0';
        }

        row.appendChild(charDiv);
        row.appendChild(codeDiv);
        resultsDiv.appendChild(row);
    });
}

// Clear all
function clearAll() {
    inputText.value = '';
    resultsDiv.innerHTML = '';
    statsSection.style.visibility = 'hidden';
    inputText.focus();
}
