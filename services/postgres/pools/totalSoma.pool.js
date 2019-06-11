const Pool = require('./pool');
const ImpostoPool = require('./imposto.pool');

const {
  TotalSoma,
  Retencao,
  Acumulado,
} = require('../models');

class TotalSomaPool extends Pool {
  constructor(totalSoma, impostoPool, retencao, acumulado) {
    super([totalSoma, impostoPool, retencao, acumulado]);
    this.totalSoma = totalSoma;
    this.impostoPool = impostoPool;
    this.retencao = retencao;
    this.acumulado = acumulado;
  }

  async save() {
    const impostoId = await this.impostoPool.save();
    const retencaoId = await this.retencao.save();
    const acumuladoId = await this.acumulado.save();

    this.totalSoma.impostoId = impostoId;
    this.totalSoma.retencaoId = retencaoId;
    this.totalSoma.acumuladoId = acumuladoId;

    return this.totalSoma.save();
  }

  static async getById(id) {
    const [totalSoma] = await TotalSoma.getBy({ id });
    if (totalSoma) {
      return new Promise((resolve, reject) => {
        Promise.all([
          ImpostoPool.getById(totalSoma.impostoId),
          Retencao.getBy('id', totalSoma.retencaoId),
          Acumulado.getBy('id', totalSoma.acumuladoId),
        ]).then(([
          [impostoPool],
          [retencao],
          [acumulado],
        ]) => {
          resolve(new TotalSomaPool(totalSoma, impostoPool, retencao, acumulado));
        })
          .catch(reject);
      });
    }

    return undefined;
  }
}

module.exports = TotalSomaPool;
