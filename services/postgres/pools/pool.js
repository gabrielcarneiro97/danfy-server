const Table = require('../models/table.model');

class Pool {
  constructor(objs) {
    const not = objs.find(o => !(o instanceof Table) && !(o instanceof Pool));

    if (not) throw new Error('Todos os elementos da Pool devem ser instancias de Pool ou de Table!');
  }

  async save() {
    return this;
  }
}

module.exports = Pool;
