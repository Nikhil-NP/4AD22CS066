const express = require('express');
const axios = require('axios');

const PORT = 9876;
const app = express();
const windowSize = 10;
const timeOut = 500;

// Authentication details
const authDetails = {
  token_type: "Bearer",
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ2ODUzOTkyLCJpYXQiOjE3NDY4NTM2OTIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImRhODgwZmViLTY5ZmQtNGFkMC1hOTUxLTI0NDQ3OTg4MGZhZSIsInN1YiI6Im5pa2hpbHJhanB1cm9oaXRua3BAZ21haWwuY29tIn0sImVtYWlsIjoibmlraGlscmFqcHVyb2hpdG5rcEBnbWFpbC5jb20iLCJuYW1lIjoibmlraGlsIHB1cm9oaXQiLCJyb2xsTm8iOiI0YWQyMmNzMDY2IiwiYWNjZXNzQ29kZSI6IlVudkN1cSIsImNsaWVudElEIjoiZGE4ODBmZWItNjlmZC00YWQwLWE5NTEtMjQ0NDc5ODgwZmFlIiwiY2xpZW50U2VjcmV0IjoieHZNdm1mVm56eU5TbUh2VCJ9.dIqIZN4gRt7jKialex4kZL4HuCmdO_k5M9-m1gYjDo4"
};

let windowNumbers = [];  

const endpoints = {
    p: "http://20.244.56.144/evaluation-service/primes",
    f: "http://20.244.56.144/evaluation-service/fibo",
    e: "http://20.244.56.144/evaluation-service/even",
    r: "http://20.244.56.144/evaluation-service/rand"
};

// Helper function to refresh token if needed
async function refreshToken() {
  try {
    // Only implement if you have the credentials to refresh
    console.log("You may need to refresh your token if it's expired");
    // In a real implementation, you would call the auth endpoint again
  } catch (error) {
    console.error("Error refreshing token:", error.message);
  }
}

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;
    console.log(`Received request for number type: ${numberid}`);

    if (!endpoints[numberid]) {
        return res.status(400).json({ error: "Invalid number ID" });
    }
    
    const url = endpoints[numberid];
    console.log(`Fetching data from ${url}`);
    const prevState = [...windowNumbers];

    let numbersFromAPI = [];

    try {
        console.log("Making API request with authorization...");
        console.log(`Using token: ${authDetails.token_type} ${authDetails.access_token.substring(0, 20)}...`);
        
        const response = await axios.get(url, { 
            timeout: timeOut,
            headers: {
                'Authorization': `${authDetails.token_type} ${authDetails.access_token}`
            }
        });
        
        console.log("API Response status:", response.status);
        console.log("API Response data:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        numbersFromAPI = response.data.numbers || [];
        console.log(`Received ${numbersFromAPI.length} numbers from API`);
    } catch (err) {
        console.error(`Error fetching data: ${err.message}`);
        console.error("Error details:", err.response ? JSON.stringify(err.response.data) : "No response data");
        
        // Check if it's an auth error
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log("Authentication error detected. Token might be expired.");
            // await refreshToken();  // Uncomment if you implement token refresh
        }
        
        numbersFromAPI = [];
    }

    // Add unique numbers to window
    const initialWindowSize = windowNumbers.length;
    for (const num of numbersFromAPI) {
        if (!windowNumbers.includes(num)) {
            windowNumbers.push(num);
        }
    }
    console.log(`Added ${windowNumbers.length - initialWindowSize} unique numbers to window`);

    // Limit window size and remove oldest entries first
    if (windowNumbers.length > windowSize) {
        console.log(`Window size exceeded. Trimming from ${windowNumbers.length} to ${windowSize}`);
        windowNumbers = windowNumbers.slice(-windowSize);
    }

    // Calculate average
    const avg = windowNumbers.length > 0 
        ? windowNumbers.reduce((a, b) => a + b, 0) / windowNumbers.length 
        : 0;
    console.log(`Window size: ${windowNumbers.length}, Average: ${avg.toFixed(2)}`);

    const response = {
        windowPrevState: prevState,
        windowCurrState: windowNumbers,
        numbers: numbersFromAPI,
        avg: parseFloat(avg.toFixed(2))
    };
    
    console.log("Sending response:", JSON.stringify(response).substring(0, 100) + "...");
    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});