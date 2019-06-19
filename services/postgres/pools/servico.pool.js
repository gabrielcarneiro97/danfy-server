const Pool = require('./pool');
const {
  Servico,
  MetaDados,
  Retencao,
  Imposto,
} = require('../models');

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
    if (this.metaDados) await this.metaDados.del();
    return this.servico.del();
  }

  static async getById(id) {
    const [servico] = await Servico.getBy({ id });
    const [metaDados] = servico.metaDadosId ? await MetaDados.getBy('md_id', servico.metaDadosId) : [null];

    const [[retencao], [imposto]] = await Promise.all([
      Retencao.getBy('id', servico.retencaoId),
      Imposto.getBy('id', servico.impostoId),
    ]);

    return new ServicoPool(servico, metaDados, imposto, retencao);
  }

  static async getByNotaChave(notaChave) {
    const servicos = await Servico.getBy({ notaChave });
    const servicosPool = await Promise.all(servicos.map(async o => ServicoPool.getById(o.id)));
    let servicoPool;

    if (servicosPool.length === 1) {
      [servicoPool] = servicosPool;
    } else {
      servicosPool.forEach((sp) => {
        if (sp.metaDados) {
          servicoPool = sp.metaDados.ativo ? sp : servicoPool;
        }
      });
    }
    return servicoPool;
  }
}

module.exports = ServicoPool;
