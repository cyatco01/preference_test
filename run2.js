const fs = require("fs");
const express = require("express");
const path = require("path");

// Function to convert CSV to JSON
function convertCsvToTextSamples(filePath) {
  const csvContent = fs.readFileSync(filePath, "utf-8");

  // Split rows and remove empty lines
  const rows = csvContent.split(/\r?\n/).filter(row => row.trim() !== "");
  const headers = rows.shift().split(",").map(header => header.trim());

  // Check if required columns exist
  const requiredColumns = ['Overview', 'Sentiment_Score', 'Valence_Score', 'Arousal_Score', 'Dominance_Score', 'Tempo'];
  for (let column of requiredColumns) {
    if (!headers.includes(column)) {
      throw new Error(`Missing required column: ${column}`);
    }
  }

  // Map rows into JSON objects
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

// Load movie data from CSV
let moviesData;
try {
  moviesData = convertCsvToTextSamples("./movies_training.csv"); // Debug log for first 5 rows
} catch (err) {
  console.error("Error loading CSV:", err);
}

const app = express();
console.log("Movies Data Injected into HTML:", moviesData.slice(0, 5));

// Serve HTML with embedded JSON
app.get("/", (req, res) => {
  const htmlFile = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

  // Replace placeholder with the JSON data
  const injectedHtml = htmlFile.replace(
    '<!-- Backend will populate this JSON -->',
    JSON.stringify(moviesData)
  );

  // Send the modified HTML
  res.send(injectedHtml);
});

// Debug route to view JSON data
app.get("/test", (req, res) => {
  res.json(moviesData.slice(0, 5)); // Serve the first 5 rows for debugging
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
