import * as express from 'express';
import { pg } from '../services/pg.service';

const { version: api } = require('../package.json');

const versionRouter = express();

versionRouter.get('/', async (req, res) => {
  const [{ version: db }] = (await pg.raw('SELECT version();')).rows;
  const node = process.version;

  res.send({ node, api, db });
});

export default versionRouter;
