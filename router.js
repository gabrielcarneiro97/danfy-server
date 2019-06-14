const express = require('express');
const bodyParser = require('body-parser');

const movimentosRouter = require('./routers/movimentos.router');
const fileRouter = require('./routers/file.router');
const trimestreRouter = require('./routers/trimestre.router');
const servicosRouter = require('./routers/servicos.router');
const dominioRouter = require('./routers/dominio.router');
const aliquotasRouter = require('./routers/aliquotas.router');
const pessoasRouter = require('./routers/pessoas.router');

const app = express();

app.use('/file', fileRouter);

app.use('/movimentos', movimentosRouter);

app.post('/servicos/push', bodyParser.json(), servicosRouter.post.push);
app.get('/servicos/calcular', servicosRouter.get.calcular);
app.get('/servicos/id', servicosRouter.get.id);
app.get('/servicos/nota', servicosRouter.get.nota);
app.delete('/servicos/id', servicosRouter.delete.id);

app.get('/trimestre', trimestreRouter.get.root);

app.use('/dominio', dominioRouter);

app.post('/aliquotas', bodyParser.json(), aliquotasRouter.post.root);
app.get('/aliquotas', aliquotasRouter.get.root);

app.get('/pessoas/flat', pessoasRouter.get.flat);

module.exports = {
  app,
};
