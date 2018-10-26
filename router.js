const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');

const movimentosRouter = require('./routers/movimentos.router');
const fileRouter = require('./routers/file.router');
const trimestreRouter = require('./routers/trimestre.router');
const servicosRouter = require('./routers/servicos.router');
const dominioRouter = require('./routers/dominio.router');
const aliquotasRouter = require('./routers/aliquotas.router');
const pessoasRouter = require('./routers/pessoas.router');

const app = express();
const upload = multer();

app.options('*', cors());
app.use(cors());

app.post('/file', upload.single('file'), fileRouter.post.root);

app.post('/movimentos/calcular', bodyParser.json(), movimentosRouter.post.calcular);
app.post('/movimentos/push', bodyParser.json(), movimentosRouter.post.push);
app.get('/movimentos/valor', movimentosRouter.get.valor);
app.get('/movimentos/slim', movimentosRouter.get.slim);
app.get('/movimentos/notaFinal', movimentosRouter.get.notaFinal);

app.get('/servicos', servicosRouter.get.root);

app.get('/trimestre', trimestreRouter.get.root);

app.post('/dominio/empresa', bodyParser.json(), dominioRouter.post.empresa);
app.get('/dominio', dominioRouter.get.root);
app.get('/dominio/id', dominioRouter.get.id);

app.post('/aliquotas', bodyParser.json(), aliquotasRouter.post.root);
app.get('/aliquotas', aliquotasRouter.get.root);

app.get('/pessoas/flat', pessoasRouter.get.flat);

module.exports = {
  app,
};
