const express = require('express');
const path = require('path');
const { app: danfy } = require('./router');

const app = express();

app.use('/api', danfy);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/static/:folder/:file', (req, res) => {
  const { folder, file } = req.params;
  res.sendFile(path.join(__dirname, 'build', 'static', folder, file));
});

app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'service-worker.js'));
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'manifest.json'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'favicon.ico'));
});

const server = app.listen(8080, () => {
  const { address } = server.address();
  const { port } = server.address();
  console.log(`Example app listening at http://${address}:${port}`);
});
