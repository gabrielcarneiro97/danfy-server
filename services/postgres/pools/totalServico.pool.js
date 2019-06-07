const Pool = require('./pool');

const { TotalServico, Imposto, Retencao } = require('../models');

class TotalServicoPool extends Pool {
  constructor(totalServico, imposto, retencao) {
    super([totalServico, imposto, retencao]);
    this.totalServico = totalServico;
    this.imposto = imposto;
    this.retencao = retencao;
  }

  async save() {
    const retencaoId = await this.retencao.save();
    const impostoId = await this.imposto.save();

    this.totalServico.impostoId = impostoId;
    this.totalServico.retencaoId = retencaoId;

    return this.totalServico.save();
  }

  static async getById(id) {
    const [totalServico] = await TotalServico.getBy({ id });
    return new Promise((resolve, reject) => {
      Promise.all([
        Imposto.getBy('id', totalServico.impostoId),
        Retencao.getBy('id', totalServico.retencaoId),
      ]).then(([
        [imposto],
        [retencao],
      ]) => resolve(new TotalServicoPool(totalServico, imposto, retencao)))
        .catch(reject);
    });
  }
}

module.exports = TotalServicoPool;
