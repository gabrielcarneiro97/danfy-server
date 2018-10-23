const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');

const movimentosRouter = require('./routers/movimentos.router');
const fileRouter = require('./routers/file.router');
const trimestreRouter = require('./routers/trimestre.router');
const servicoRouter = require('./routers/servico.router');

const app = express();
const upload = multer();

app.options('*', cors());
app.use(cors());

app.post('/file', upload.single('file'), fileRouter.root);

app.post('/movimentos', bodyParser.json(), movimentosRouter.root);
app.get('/movimentos/valor', movimentosRouter.valor);
app.get('/movimentos/slim', movimentosRouter.slim);

app.get('/servico', servicoRouter.root);

app.get('/trimestre', trimestreRouter.root);

module.exports = {
  app,
};
