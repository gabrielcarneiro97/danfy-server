const Pool = require('./pool');
const ImpostoPool = require('./imposto.pool');

const { TotalMovimento } = require('../models');

class TotalMovimentoPool extends Pool {
  constructor(totalMovimento, impostoPool) {
    super([totalMovimento, impostoPool]);
    this.totalMovimento = totalMovimento;
    this.impostoPool = impostoPool;
  }

  async save() {
    const impostoId = await this.impostoPool.save();
    this.totalMovimento.impostoId = impostoId;

    return this.totalMovimento.save();
  }

  static async getById(id) {
    const [totalMovimento] = await TotalMovimento.getBy({ id });
    const [impostoPool] = await ImpostoPool.getById(totalMovimento.impostoId);

    return new TotalMovimentoPool(totalMovimento, impostoPool);
  }
}

module.exports = TotalMovimentoPool;
