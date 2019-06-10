const Pool = require('./pool');

class MovimentoPool extends Pool {
  constructor(movimento, metaDados, impostoPool) {
    super([movimento, metaDados, impostoPool]);
    this.movimento = movimento;
    this.metaDados = metaDados;
    this.impostoPool = impostoPool;
  }

  async save() {
    const impostoId = await this.impostoPool.save();
    const metaDadosId = await this.metaDados.save();
    this.movimento.impostoId = impostoId;
    this.movimento.metaDadosId = metaDadosId;

    return this.movimento.save();
  }
}

module.exports = MovimentoPool;
