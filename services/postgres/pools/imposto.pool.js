const Pool = require('./pool');

const { Imposto, Icms } = require('../models');

class ImpostoPool extends Pool {
  constructor(imposto, icms) {
    super([imposto, icms]);

    this.imposto = imposto;
    this.icms = icms;
  }

  async save() {
    const icmsId = await this.icms.save();
    this.imposto.icmsId = icmsId;

    return this.imposto.save();
  }

  soma(impostoPool) {
    this.imposto.soma(impostoPool.imposto);
    this.icms.soma(impostoPool.icms);
  }

  static async getById(id) {
    const [imposto] = await Imposto.getBy({ id });
    const [icms] = await Icms.getBy('id', imposto.icmsId);

    return [new ImpostoPool(imposto, icms)];
  }
}

module.exports = ImpostoPool;
