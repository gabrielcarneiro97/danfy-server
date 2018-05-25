const express = require('express');
const cors = require('cors');
const multer = require('multer');
// const bodyParser = require('body-parser');

const app = express();
const upload = multer();

app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

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

app.listen(8081, () => console.log('Example app listening on port 3001!'));
