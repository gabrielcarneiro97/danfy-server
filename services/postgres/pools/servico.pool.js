const Pool = require('./pool');

class ServicoPool extends Pool {
  constructor(servico, metaDados, imposto, retencao) {
    super([servico, metaDados, imposto, retencao]);
    this.servico = servico;
    this.metaDados = metaDados;
    this.imposto = imposto;
    this.retencao = retencao;
  }

  async save() {
    const retencaoId = await this.retencao.save();
    this.servico.retencaoId = retencaoId;

    const impostoId = await this.imposto.save();
    this.servico.impostoId = impostoId;

    if (this.metaDados) {
      const metaDadosId = await this.metaDados.save();
      this.servico.metaDadosId = metaDadosId;
    }

    return this.servico.save();
  }

  async del() {
    await this.retencao.del();
    await this.imposto.del();
    await this.metaDados.del();
    return this.servico.del();
  }
}

module.exports = ServicoPool;
