import * as express from 'express';
import * as path from 'path';
import danfy from './router';

const app = express();

require('dotenv').config();

app.use('/api', danfy);
app.use(express.static(path.join(__dirname, 'build')));

app.listen(8080, () => {
  console.log('Example app listening at http://localhost:8080');
});
