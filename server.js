const express = require('express');
const cors = require('cors');
const multer = require('multer');
// const bodyParser = require('body-parser');

const app = express();
const upload = multer();

app.options('*', cors());
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.get('/hello', (req, res) => {
  res.send('hello');
});

app.post('/notas', (req, res) => {
  console.log('/notas');
  let files = req.body;
  res.send('chegou');
});

app.post('/file', upload.single('file'), (req, res) => {
  let { file } = req;
  console.log(file);
  res.send('k');
});

const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Example app listening at http://${host}:${port}`);
});
