const express = require('express');

const movimentosRouter = require('./routers/movimentos.router');
const fileRouter = require('./routers/file.router');
const trimestreRouter = require('./routers/trimestre.router');
const servicosRouter = require('./routers/servicos.router');
const dominioRouter = require('./routers/dominio.router');
const aliquotasRouter = require('./routers/aliquotas.router');
const pessoasRouter = require('./routers/pessoas.router');
const versionRouter = require('./routers/version.router');

const app = express();

app.use('/file', fileRouter);

app.use('/movimentos', movimentosRouter);

app.use('/servicos', servicosRouter);

app.use('/trimestre', trimestreRouter);

app.use('/dominio', dominioRouter);

app.use('/aliquotas', aliquotasRouter);

app.use('/pessoas', pessoasRouter);

app.use('/version', versionRouter);

module.exports = {
  app,
};
