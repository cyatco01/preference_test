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

// Train the neural network and extract weights and biases
function trainAndExtractWeights(filePath) {
  const textSamples = convertCsvToTextSamples(filePath);
  console.log("Loaded text samples:", textSamples.length);

  const trainingData = textSamples.map(sample => ({
    input: {
      sentiment: sample.sentiment,
      valence: sample.valence,
      arousal: sample.arousal,
      dominance: sample.dominance,
      tempo: sample.tempo,
    },
    output: { liked: Math.random() > 0.5 ? 1 : 0 }, // Random output for demonstration
  }));

  const net = new brain.NeuralNetwork();
  console.log("Training the network...");
  net.train(trainingData, {
    iterations: 2000,
    errorThresh: 0.005,
  });
  console.log("Network trained!");

  // Extract weights and biases
  const layers = net.toJSON().layers;
  const weightsAndBiases = layers.map((layer, index) => ({
    layer: index,
    weights: layer.weights || null,
    biases: layer.biases || null,
  }));

  console.log("Weights and biases of the trained network:");
  weightsAndBiases.forEach(info => {
    console.log(`Layer ${info.layer}:`);
    if (info.weights) {
      console.log("  Weights:", info.weights);
    }
    if (info.biases) {
      console.log("  Biases:", info.biases);
    }
  });
}

// Test setup
function runTest() {
  const filePath = "/Users/carolynyatco/decode_ai/movies_training/movies_training.csv"; // Replace with the actual path to your CSV file
  trainAndExtractWeights(filePath);
}

// Execute the test
runTest();
