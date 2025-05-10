trying to solve problem 1
Develop Average Calculator HTTP Microservice
Create an Average Calculator microservice that exposes a REST API "numbers/{numberid}" that exclusively accepts qualified number IDs.
Qualified IDs include 'p' for prime, 'f' for Fibonacci, 'e' for even, and 'r' for random numbers. 
Configure a window size, e.g., 10.
Upon each request, fetch numbers from a third-party server and store them. Avoid implementing APIs for generating even, prime, etc., numbers; solely rely on the provided Test Server API.
Ensure stored numbers are unique, disregarding duplicates. Ignore responses taking longer than 500 ms or encountering errors.
If stored numbers are fewer than the window size, calculate their average. Limit stored numbers to the window size. Upon breaching the window size, replace the oldest number with the newest one.
Respond to each request with the numbers stored before and after the latest API call, along with the average of numbers matching the window size.
Maintain quick responses, never exceeding 500 milliseconds. Format response as follows:



how i approched this :


created a index.js
added express and AXIONs





