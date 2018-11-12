const express = require('express');
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

app.post('/file', upload.single('file'), fileRouter.post.root);

app.post('/movimentos/calcular', bodyParser.json(), movimentosRouter.post.calcular);
app.post('/movimentos/push', bodyParser.json(), movimentosRouter.post.push);
app.get('/movimentos/valor', movimentosRouter.get.valor);
app.get('/movimentos/slim', movimentosRouter.get.slim);
app.get('/movimentos/notaFinal', movimentosRouter.get.notaFinal);
app.put('/movimentos/editar', bodyParser.json(), movimentosRouter.put.editar);
app.put('/movimentos/cancelar', movimentosRouter.put.cancelar);

app.post('/servicos/push', bodyParser.json(), servicosRouter.post.push);
app.get('/servicos/calcular', servicosRouter.get.calcular);
app.get('/servicos/id', servicosRouter.get.id);
app.get('/servicos/nota', servicosRouter.get.nota);
app.delete('/servicos/id', servicosRouter.delete.id);

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
