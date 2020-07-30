import * as https from 'https';
import * as cors from 'cors';
import * as express from 'express';
import { SSL } from './services/ssl';
import danfy from './routerTS';

import Nota from './sequelize/models/Nota';

const app = express();

app.options('*', cors());
app.use(cors());
app.use('/api', danfy);

require('dotenv').config();

if (process.argv[2] === 'ssl') {
  https.createServer(SSL, app).listen(8080, () => {
    console.log('SSL server listening 8080 port');
  });
} else {
  app.listen(8080, () => {
    console.log('Example app listening at http://localhost:8080');
  });
}

(async () => {
    const nota = await Nota.findByPk(
      '26180802671595000728550000000084221087705821',
      { include: ['produtos', { association: 'emitente', include: ['endereco'] }, 'destinatario'] }
    );
  console.log(nota.toJSON());
})();
