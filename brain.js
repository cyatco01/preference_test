const fs = require("fs");



function convertCsvToTextSamples(filePath) {
  /**
   * Reads a CSV file and converts its content into a JavaScript array of text samples.
   *
   * @param {string} filePath - Path to the CSV file.
   * @returns {Array} - Array of objects formatted as text samples.
   */
  const csvContent = fs.readFileSync(filePath, "utf-8"); // Read file content as a string

  // Split rows while accounting for potential quoted fields with newlines
  const rows = csvContent.split(/\r?\n/).filter(row => row.trim() !== "");

  // Parse the header row
  const headers = rows.shift().split(",").map(header => header.trim());

  // Ensure required columns exist
  const requiredColumns = ['Overview', 'Sentiment_Score', 'Valence_Score', 'Arousal_Score', 'Dominance_Score', 'Tempo'];
  for (let column of requiredColumns) {
    if (!headers.includes(column)) {
      throw new Error(`Missing required column: ${column}`);
    }
  }

  // Map rows into objects
  const textSamples = rows.map(row => {
    // Split the row by commas but handle fields wrapped in quotes
    const values = row.match(/(".*?"|[^",]+|(?<=,)(?=,))/g).map(value => 
      value.replace(/^"|"$/g, "").trim() // Remove quotes and trim whitespace
    );

    const rowData = {};
    headers.forEach((header, index) => {
      const value = values[index];
      rowData[header] = isNaN(value) ? value : parseFloat(value); // Convert numeric values to floats
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

  return textSamples;
}


module.exports = {
    convertCsvToTextSamples,
};

// Placeholder for text samples with sentiment scores
const textSamples = [
    { text: "The sun is shining brightly, and the day feels amazing.", sentiment: 0.9 },
    { text: "It's a dark, gloomy, and depressing day outside.", sentiment: 0.2 },
    { text: "I feel absolutely wonderful and full of joy.", sentiment: 0.95 },
    { text: "I am feeling okay, not too great but not bad either.", sentiment: 0.5 },
  ];
  
  // Track user preferences for training data
  let trainingData = [];
  
  // Display two random text samples
 function loadTextSamples() {
    const text1Index = Math.floor(Math.random() * textSamples.length);
    let text2Index = Math.floor(Math.random() * textSamples.length);
    while (text2Index === text1Index) {
        text2Index = Math.floor(Math.random() * textSamples.length);
    }
    const text1 = textSamples[text1Index];
    const text2 = textSamples[text2Index];

    console.log("Text 1:", text1.text);
    console.log("Text 2:", text2.text);

    // Store current texts and their sentiment scores for later use
    global.currentText1 = text1;
    global.currentText2 = text2;
}

  
  // Record user preference
  function recordPreference(preferredText) {
    const selected = preferredText === "text1" ? currentText1 : currentText2;
    const notSelected = preferredText === "text1" ? currentText2 : currentText1;
  
    // Add user preference as training data
    trainingData.push({
      input: { sentiment: selected.sentiment },
      output: { liked: 1 },
    });
    trainingData.push({
      input: { sentiment: notSelected.sentiment },
      output: { liked: 0 },
    });
  
    console.log("Training data updated:", trainingData);
  
    // Load new samples
    loadTextSamples();
  }
  
  // Train a neural network (called after collecting enough data)
  function trainNetwork() {
    const net = new brain.NeuralNetwork();
    net.train(trainingData, {
      iterations: 2000,
      errorThresh: 0.005,
    });
    console.log("Network trained!");
  
    // Example prediction
    const output = net.run({ sentiment: 0.7 }); // Predict preference for sentiment 0.7
    console.log("Prediction for sentiment 0.7:", output);
  }
  
  // Initialize with first text samples
  loadTextSamples();

  