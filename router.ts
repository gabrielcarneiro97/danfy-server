import * as express from 'express';

import movimentosRouter from './routers/movimentos.router';
import fileRouter from './routers/file.router';
import trimestreRouter from './routers/trimestre.router';
import simplesRouter from './routers/simples.router';
import servicosRouter from './routers/servicos.router';
import dominioRouter from './routers/dominio.router';
import aliquotasRouter from './routers/aliquotas.router';
import pessoasRouter from './routers/pessoas.router';
import estoqueRouter from './routers/estoque.router';
import versionRouter from './routers/version.router';
import grupoRouter from './routers/grupo.router';

const app = express();

app.use('/file', fileRouter);

app.use('/movimentos', movimentosRouter);

app.use('/servicos', servicosRouter);

app.use('/trimestre', trimestreRouter);

app.use('/dominio', dominioRouter);

app.use('/aliquotas', aliquotasRouter);

app.use('/pessoas', pessoasRouter);

app.use('/estoque', estoqueRouter);

app.use('/version', versionRouter);

app.use('/simples', simplesRouter);

app.use('/grupo', grupoRouter);

export default app;
