const fs = require("fs");
const brain = require("brain.js");

// Function to convert CSV to text samples
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

// Placeholder for training data and simulated user preferences
let trainingData = [];

// Display two random text samples
function loadTextSamples(samples) {
  const text1Index = Math.floor(Math.random() * samples.length);
  let text2Index = Math.floor(Math.random() * samples.length);
  while (text2Index === text1Index) {
    text2Index = Math.floor(Math.random() * samples.length);
  }
  const text1 = samples[text1Index];
  const text2 = samples[text2Index];

  console.log("Text 1:", text1.text);
  console.log("Text 2:", text2.text);

  global.currentText1 = text1;
  global.currentText2 = text2;
}

// Simulate recording user preferences
function simulateUserPreference(preferredText) {
  const selected = preferredText === "text1" ? global.currentText1 : global.currentText2;
  const notSelected = preferredText === "text1" ? global.currentText2 : global.currentText1;

  trainingData.push({
    input: {
      sentiment: selected.sentiment,
      valence: selected.valence,
      arousal: selected.arousal,
      dominance: selected.dominance,
      tempo: selected.tempo,
    },
    output: { liked: 1 },
  });
  trainingData.push({
    input: {
      sentiment: notSelected.sentiment,
      valence: notSelected.valence,
      arousal: notSelected.arousal,
      dominance: notSelected.dominance,
      tempo: notSelected.tempo,
    },
    output: { liked: 0 },
  });

  console.log("Training data updated:", trainingData.length, "samples.");
}

// Train the neural network
function trainAndTestNetwork() {
  const net = new brain.NeuralNetwork();
  console.log("Training the network...");
  net.train(trainingData, {
    iterations: 2000,
    errorThresh: 0.005,
  });
  console.log("Network trained!");

  // Test the network with a new input
  const testInput = { sentiment: 0.6, valence: 0.7, arousal: 0.5, dominance: 0.8, tempo: 0.4 };
  const output = net.run(testInput);
  console.log("Prediction for test input:", testInput, "->", output);
}

// Test setup
function runTest() {
  const filePath = "/Users/carolynyatco/decode_ai/movies_training/movies_training.csv"; // Replace with the actual path to your CSV file
  const textSamples = convertCsvToTextSamples(filePath);

  console.log("Loaded text samples:", textSamples.length);

  // Simulate user preferences
  for (let i = 0; i < 5; i++) {
    loadTextSamples(textSamples);
    const userChoice = Math.random() > 0.5 ? "text1" : "text2"; // Simulate random user choice
    simulateUserPreference(userChoice);
  }

  trainAndTestNetwork();
}

// Execute the test
runTest();
