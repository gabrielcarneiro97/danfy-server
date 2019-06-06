const Pool = require('./pool');

class MovimentoPool extends Pool {
  constructor(movimento, metaDados, imposto, icms) {
    super([movimento, metaDados, imposto, icms]);
    this.movimento = movimento;
    this.metaDados = metaDados;
    this.imposto = imposto;
    this.icms = icms;
  }

  async save() {
    const icmsId = await this.icms.save();
    this.imposto.icmsId = icmsId;
    const impostoId = await this.imposto.save();
    const metaDadosId = await this.metaDados.save();
    this.movimento.impostoId = impostoId;
    this.movimento.metaDadosId = metaDadosId;

    return this.movimento.save();
  }
}

module.exports = MovimentoPool;
