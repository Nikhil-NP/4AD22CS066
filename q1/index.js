const express = require('express');
const axios = require('axios');

const PORT = 9876;
const app = express();
const windowSize = 10;
const timeOut = 500;

//i need .env but due to time constraints i kept it as it is 
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

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;

    if (!endpoints[numberid]) {
        return res.status(400).json({ error: "Invalid number ID" });
    }
    
    const url = endpoints[numberid];
    const prevState = [...windowNumbers];

    let numbersFromAPI = [];

    try {
        const response = await axios.get(url, { 
            timeout: timeOut,
            headers: {
                'Authorization': `${authDetails.token_type} ${authDetails.access_token}`
            }
        });
        numbersFromAPI = response.data.numbers || [];
    } catch (err) {
        console.error(`Error fetching data: ${err.message}`);
        numbersFromAPI = [];
    }

    // Add unique numbers to window
    for (const num of numbersFromAPI) {
        if (!windowNumbers.includes(num)) {
            windowNumbers.push(num);
        }
    }

    // Limit window size and remove oldest entries first
    if (windowNumbers.length > windowSize) {
        windowNumbers = windowNumbers.slice(-windowSize);
    }

    // Calculate average
    const avg = windowNumbers.length > 0 
        ? windowNumbers.reduce((a, b) => a + b, 0) / windowNumbers.length 
        : 0;

    res.json({
        windowPrevState: prevState,
        windowCurrState: windowNumbers,
        numbers: numbersFromAPI,
        avg: parseFloat(avg.toFixed(2))
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});