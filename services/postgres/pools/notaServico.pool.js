const Pool = require('./pool');

class NotaServicoPool extends Pool {
  constructor(notaServico, retencao) {
    super([notaServico, retencao]);
    this.notaServico = notaServico;
    this.retencao = retencao;
  }

  async save() {
    const retencaoId = await this.retencao.save();
    this.notaServico.retencaoId = retencaoId;

    return this.notaServico.save();
  }
}

module.exports = NotaServicoPool;
