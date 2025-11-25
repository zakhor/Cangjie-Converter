import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Load Cangjie data
console.log('Loading Cangjie5 database...');
const cangjieDataPath = path.join(__dirname, 'data/cangjie5.json');
const cangjieMap = JSON.parse(fs.readFileSync(cangjieDataPath, 'utf8'));
console.log(`Loaded ${Object.keys(cangjieMap).length} character mappings`);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API endpoint to convert characters to Cangjie codes
app.post('/api/convert', (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Invalid input: text is required' });
    }

    const results = [];
    for (const char of text) {
        // Skip whitespace and punctuation
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

    res.json({
        input: text,
        results: results,
        totalCharacters: results.length,
        foundCount: results.filter(r => r.found).length,
        notFoundCount: results.filter(r => !r.found).length
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        charactersLoaded: Object.keys(cangjieMap).length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Cangjie Converter server running on http://localhost:${PORT}`);
});
