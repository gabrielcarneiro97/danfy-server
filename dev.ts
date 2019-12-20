import * as https from 'https';
import * as cors from 'cors';
import * as express from 'express';
import { SSL } from './services/ssl';
import danfy from './router';

const app = express();

app.options('*', cors());
app.use(cors());
app.use('/api', danfy);

if (process.argv[2] === 'ssl') {
  https.createServer(SSL, app).listen(8080, () => {
    console.log('SSL server listening 8080 port');
  });
} else {
  app.listen(8080, () => {
    console.log('Example app listening at http://localhost:8080');
  });
}
