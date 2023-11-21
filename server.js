const express = require('express');
const https = require('https');
const fs = require('fs');
const apiRoutes = require('./routes/api');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: '*',
  methods: 'GET', // adjust this based on the allowed HTTP methods
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', apiRoutes);

// Load SSL/TLS certificates
const privateKey = fs.readFileSync('path/to/private-key.pem', 'utf8');
const certificate = fs.readFileSync('path/to/certificate.pem', 'utf8');
const ca = fs.readFileSync('path/to/ca.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

// Create an HTTPS server
const server = https.createServer(credentials, app);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});