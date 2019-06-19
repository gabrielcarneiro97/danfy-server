const Pool = require('./pool');
const { NotaServico, Retencao } = require('../models');

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

  static async getByChave(chave) {
    const [notaServico] = await NotaServico.getBy({ chave });
    const [retencao] = await Retencao.getBy('id', notaServico.retencaoId);

    return new NotaServicoPool(notaServico, retencao);
  }
}

module.exports = NotaServicoPool;
