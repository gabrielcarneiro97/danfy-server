const Pool = require('./pool');

const { TotalMovimento, Imposto, Icms } = require('../models');

class TotalMovimentoPool extends Pool {
  constructor(totalMovimento, imposto, icms) {
    super([totalMovimento, imposto, icms]);
    this.totalMovimento = totalMovimento;
    this.imposto = imposto;
    this.icms = icms;
  }

  async save() {
    const icmsId = await this.icms.save();
    this.imposto.icmsId = icmsId;
    const impostoId = await this.imposto.save();

    this.totalMovimento.impostoId = impostoId;

    return this.totalMovimento.save();
  }

  static async getById(id) {
    const [totalMovimento] = await TotalMovimento.getBy({ id });
    const [imposto] = await Imposto.getBy('id', totalMovimento.impostoId);
    const [icms] = await Icms.getBy('id', imposto.icmsId);

    return new TotalMovimentoPool(totalMovimento, imposto, icms);
  }
}

module.exports = TotalMovimentoPool;
