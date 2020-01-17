import Pool from './pool';

import {
  pgNum, pgStr,
} from '../models/table.model';
import Servico from '../models/servico.model';
import MetaDados from '../models/metaDados.model';
import Retencao from '../models/retencao.model';
import Imposto from '../models/imposto.model';

export default class ServicoPool extends Pool {
  servico : Servico;
  metaDados : MetaDados;
  imposto : Imposto;
  retencao : Retencao;

  constructor(servico : Servico, metaDados : MetaDados, imposto : Imposto, retencao : Retencao) {
    super([servico, metaDados, imposto, retencao]);
    this.servico = servico;
    this.metaDados = metaDados;
    this.imposto = imposto;
    this.retencao = retencao;
  }

  async save() {
    const retencaoId = await this.retencao.save();
    this.servico.retencaoId = <number> retencaoId;

    const impostoId = await this.imposto.save();
    this.servico.impostoId = <number> impostoId;

    if (this.metaDados) {
      const metaDadosId = await this.metaDados.save();
      this.servico.metaDadosId = <number> metaDadosId;
    }

    return this.servico.save();
  }

  async del() {
    return this.servico.del();
  }

  static async getById(id : pgNum) {
    const [servico] = await Servico.getBy({ id });
    const [metaDados] = servico.metaDadosId ? await MetaDados.getBy('md_id', servico.metaDadosId.toString()) : [null];

    const [[retencao], [imposto]] = await Promise.all([
      Retencao.getBy('id', servico.retencaoId.toString()),
      Imposto.getBy('id', servico.impostoId.toString()),
    ]);

    return new ServicoPool(servico, metaDados, imposto, retencao);
  }

  static async getByNotaChave(notaChave : pgStr) {
    const servicos = await Servico.getBy({ notaChave });
    const servicosPool = await Promise.all(servicos.map(async (o) => ServicoPool.getById(o.id)));
    let servicoPool : ServicoPool;

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
