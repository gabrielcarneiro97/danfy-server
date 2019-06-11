const Pool = require('./pool');
const ImpostoPool = require('./imposto.pool');
const MovimentoPool = require('./movimento.pool');

const { TotalMovimento } = require('../models');

class TotalMovimentoPool extends Pool {
  constructor(totalMovimento, impostoPool) {
    super([totalMovimento, impostoPool]);
    this.totalMovimento = totalMovimento;
    this.impostoPool = impostoPool;
  }

  soma(pool) {
    if (pool instanceof MovimentoPool) {
      this.totalMovimento.soma(pool.movimento);
    } else if (pool instanceof TotalMovimento) {
      this.totalMovimento.soma(pool.totalMovimento);
    }
    this.impostoPool.soma(pool.impostoPool);
  }

  async save() {
    const impostoId = await this.impostoPool.save();
    this.totalMovimento.impostoId = impostoId;

    return this.totalMovimento.save();
  }

  static async getById(id) {
    const [totalMovimento] = await TotalMovimento.getBy({ id });
    if (totalMovimento) {
      const [impostoPool] = await ImpostoPool.getById(totalMovimento.impostoId);
      return new TotalMovimentoPool(totalMovimento, impostoPool);
    }
    return undefined;
  }
}

module.exports = TotalMovimentoPool;
