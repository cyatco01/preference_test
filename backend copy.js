const fs = require("fs");
const express = require("express");
const path = require("path");

// Your existing code: `convertCsvToTextSamples` function
function convertCsvToTextSamples(filePath) {
  const csvContent = fs.readFileSync(filePath, "utf-8");

  const rows = csvContent.split(/\r?\n/).filter(row => row.trim() !== "");
  const headers = rows.shift().split(",").map(header => header.trim());

  const requiredColumns = ['Overview', 'Sentiment_Score', 'Valence_Score', 'Arousal_Score', 'Dominance_Score', 'Tempo'];
  for (let column of requiredColumns) {
    if (!headers.includes(column)) {
      throw new Error(`Missing required column: ${column}`);
    }
  }

  return rows.map(row => {
    const values = row.match(/(".*?"|[^",]+|(?<=,)(?=,))/g).map(value =>
      value.replace(/^"|"$/g, "").trim()
    );

    const rowData = {};
    headers.forEach((header, index) => {
      const value = values[index];
      rowData[header] = isNaN(value) ? value : parseFloat(value);
    });

    return {
      text: rowData['Overview'],
      sentiment: parseFloat(rowData['Sentiment_Score']),
      valence: parseFloat(rowData['Valence_Score']),
      arousal: parseFloat(rowData['Arousal_Score']),
      dominance: parseFloat(rowData['Dominance_Score']),
      tempo: parseFloat(rowData['Tempo']),
    };
  });
}

// Your existing textSamples (Placeholder for testing)
const textSamples = [
  { text: "The sun is shining brightly, and the day feels amazing.", sentiment: 0.9 },
  { text: "It's a dark, gloomy, and depressing day outside.", sentiment: 0.2 },
  { text: "I feel absolutely wonderful and full of joy.", sentiment: 0.95 },
  { text: "I am feeling okay, not too great but not bad either.", sentiment: 0.5 },
];

// New Backend Server Setup
const app = express();

// Load movie data from CSV
const moviesData = convertCsvToTextSamples("/Users/carolynyatco/deocde_ai/get_weights/movies_training.csv");

// Serve HTML with embedded JSON
app.get("/", (req, res) => {
  const htmlFile = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const injectedHtml = htmlFile.replace(
    '<!-- Backend will populate this JSON -->',
    JSON.stringify(moviesData)
  );
  res.send(injectedHtml);
});

// Serve static files if needed
app.use(express.static(path.join(__dirname)));

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
