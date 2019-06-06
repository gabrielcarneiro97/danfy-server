const Table = require('../models/table.model');

class Pool {
  constructor(objs) {
    const err = objs.find(o => !(o instanceof Table));

    if (err) throw err;
  }

  async save() {
    return this;
  }
}

module.exports = Pool;
