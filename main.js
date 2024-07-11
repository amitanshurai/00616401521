const express = require('express');
const axios = require('axios');

const app = express();

const WINDOW_SIZE = 10;
let storageNumbers = {};

// Function to fetch numbers from third-party server
async function fetchNumbers(numberType) {
  try {
    const response = await axios.get(`http://20.244.56.144/test/${numberType}`);
    return response.data.numbers;
  } catch (error) {
    console.error('Error while receiving numbers: ', error.message);
    return [];
  }
}

// Function to calculate the average
function calculateAverage(numbers) {
  if (!numbers.length) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

// Function to add numbers to stored numbers by taking into account the window size
function addNumbers(numberType, numbers) {
  if (!storageNumbers[numberType]) {
    storageNumbers[numberType] = [];
  }
  storageNumbers[numberType] = storageNumbers[numberType].concat(numbers);
  if (storageNumbers[numberType].length > WINDOW_SIZE) {
    storageNumbers[numberType] = storageNumbers[numberType].slice(-WINDOW_SIZE);
  }
}

// Endpoint to process requests for numbers of different types
app.get('/numbers/:numberType', async (req, res) => {
  const { numberType } = req.params;

  // Retrieve numbers from the third-party server
  const numbersFromServer = await fetchNumbers(numberType);

  // Add numbers to stored numbers
  addNumbers(numberType, numbersFromServer);

  // Calculate the average
  const currentNumbers = storageNumbers[numberType];
  const currentAverage = calculateAverage(currentNumbers);

  // Prepare the response
  const response = {
    windowPrevState: currentNumbers.slice(0, -numbersFromServer.length),
    windowCurrState: currentNumbers,
    number: numbersFromServer[numbersFromServer.length - 1],
    avg: parseFloat(currentAverage.toFixed(2)),
  };

  res.json(response);
});

const port = process.env.PORT || 3006;
app.listen(port, () => {
  console.log(`The server is running on ${port}`);
});
