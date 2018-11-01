const { mongo } = require('./private');

const HOST = `mongodb+srv://${mongo.login}:${mongo.password}@danfy-mongo-dpgbu.mongodb.net/${mongo.dbName}?retryWrites=true`;
const CONFIG = { useNewUrlParser: true };

module.exports = {
  HOST,
  CONFIG,
};
