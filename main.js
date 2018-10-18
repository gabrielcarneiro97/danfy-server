const https = require('https');
const { SSL } = require('./services');
const { app } = require('./router');


if (process.argv[2] === 'ssl') {
  https.createServer(SSL, app).listen(8080, () => {
    console.log('SSL server listening 8080 port');
  });
} else {
  const server = app.listen(8080, () => {
    const { address } = server.address();
    const { port } = server.address();
    console.log(`Example app listening at http://${address}:${port}`);
  });
}
