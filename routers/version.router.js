const express = require('express');
const { version: api } = require('../package.json');
const { pg } = require('../services/pg.service');

const versionRouter = express();

versionRouter.get('/', async (req, res) => {
  const [{ version: db }] = (await pg.raw('SELECT version();')).rows;
  const node = process.version;

  res.send({ node, api, db });
});

module.exports = versionRouter;
