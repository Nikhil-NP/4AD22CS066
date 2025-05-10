const express = require('express')
const axios = require('axios')

const PORT = 9876;
const app = express();
const windowSize = 10;
const timeOut = 500


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
        return res.status(400);
      }
    
      const url = endpoints[numberid];
      const prevState = [...windowNumbers];

      let numbersFromAPI = [];

      try {
        const response = await axios.get(url, { timeout: timeOut });
        numbersFromAPI = response.data.numbers || [];
      } catch (err) {
        
        numbersFromAPI = [];
      }


    // forget duplicates
  for (const num of numbersFromAPI) {
    if (!windowNumbers.includes(num)) {
      windowNumbers.push(num);
    }
  }


  //  window ] limit
  if (windowNumbers.length > windowSize) {
    windowNumbers = windowNumbers.slice(-windowSize);
  }

//calc avg

const avg = (windowNumbers.reduce((a, b) => a + b, 0) / windowNumbers.length) || 0;


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

