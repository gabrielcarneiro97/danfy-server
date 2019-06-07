const Pool = require('./pool');

const {
  TotalSoma,
  Imposto,
  Retencao,
  Acumulado,
  Icms,
} = require('../models');

class TotalSomaPool extends Pool {
  constructor(totalSoma, imposto, icms, retencao, acumulado) {
    super([totalSoma, imposto, icms, retencao, acumulado]);
    this.totalSoma = totalSoma;
    this.imposto = imposto;
    this.icms = icms;
    this.retencao = retencao;
    this.acumulado = acumulado;
  }

  async save() {
    const icmsId = await this.icms.save();
    this.imposto.icmsId = icmsId;

    const impostoId = await this.imposto.save();
    const retencaoId = await this.retencao.save();
    const acumuladoId = await this.acumulado.save();

    this.totalSoma.impostoId = impostoId;
    this.totalSoma.retencaoId = retencaoId;
    this.totalSoma.acumuladoId = acumuladoId;

    return this.totalSoma.save();
  }

  static async getById(id) {
    const [totalSoma] = await TotalSoma.getBy({ id });
    return new Promise((resolve, reject) => {
      Promise.all([
        Imposto.getBy('id', totalSoma.impostoId),
        Retencao.getBy('id', totalSoma.retencaoId),
        Acumulado.getBy('id', totalSoma.acumuladoId),
      ]).then(([
        [imposto],
        [retencao],
        [acumulado],
      ]) => {
        Icms.getBy('id', imposto.icmsId).then(([icms]) => {
          resolve(new TotalSomaPool(totalSoma, imposto, icms, retencao, acumulado));
        }).catch(reject);
      })
        .catch(reject);
    });
  }
}

module.exports = TotalSomaPool;
