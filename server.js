const express = require('express');
const path = require('path');
const { app: danfy } = require('./router');

const app = express();

app.use('/api', danfy);
app.use(express.static(path.join(__dirname, 'build')));

const server = app.listen(8080, () => {
  const { address } = server.address();
  const { port } = server.address();
  console.log(`Example app listening at http://${address}:${port}`);
});
