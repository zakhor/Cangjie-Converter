# Cangjie Converter - 倉頡輸入法查詢工具

A web-based tool to convert Chinese characters to Cangjie (倉頡) input method codes.

## Features

- **Comprehensive Database**: 103,602 Chinese characters mapped to 5th generation Cangjie codes (五代倉頡)
- **Batch Conversion**: Convert multiple characters at once
- **Real-time Results**: Instant lookup with visual feedback
- **Click to Copy**: Click any result to copy the Cangjie code to clipboard
- **Beautiful UI**: Modern, responsive design with gradient backgrounds
- **Statistics**: Shows total characters, found/not found counts

## Data Source

This project uses the high-quality Cangjie5 database from [Jackchows/Cangjie5](https://github.com/Jackchows/Cangjie5) (MIT License).

## Installation

1. Clone the repository:
```bash
cd c:\Users\ksyrk\source\repos\zakhor
git clone <repository-url> Cangjie-Converter
cd Cangjie-Converter
```

2. Install dependencies:
```bash
npm install
```

3. Parse the Cangjie data (first time only):
```bash
npm run parse-data
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Enter Chinese characters in the input field and click "查詢倉頡碼" (Convert)

4. Click on any result card to copy the Cangjie code to your clipboard

## API Endpoints

### POST /api/convert

Convert Chinese characters to Cangjie codes.

**Request:**
```json
{
  "text": "你好世界"
}
```

**Response:**
```json
{
  "input": "你好世界",
  "results": [
    {
      "character": "你",
      "cangjie": "oip",
      "found": true
    },
    {
      "character": "好",
      "cangjie": "vnd",
      "found": true
    },
    {
      "character": "世",
      "cangjie": "pt",
      "found": true
    },
    {
      "character": "界",
      "cangjie": "wlb",
      "found": true
    }
  ],
  "totalCharacters": 4,
  "foundCount": 4,
  "notFoundCount": 0
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "charactersLoaded": 103602
}
```

## Project Structure

```
Cangjie-Converter/
├── package.json              # Project configuration
├── server.js                 # Express server
├── README.md                 # This file
├── data/
│   ├── Cangjie5_TC.txt      # Raw data (downloaded)
│   └── cangjie5.json        # Parsed JSON database
├── scripts/
│   └── parse-cangjie-data.js # Data parser script
└── public/
    ├── index.html            # Main HTML page
    ├── style.css             # Styles
    └── app.js                # Client-side JavaScript
```

## Technology Stack

- **Backend**: Node.js with Express 5.x
- **Frontend**: Vanilla JavaScript (ES6)
- **Data**: JSON (103,602 character mappings)
- **Module System**: ES Modules

## License

MIT License

## Credits

- Cangjie5 database: [Jackchows/Cangjie5](https://github.com/Jackchows/Cangjie5) (MIT License)
- Developed as part of the zakhor project collection
