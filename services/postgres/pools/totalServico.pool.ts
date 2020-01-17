import Pool from './pool';
import ServicoPool from './servico.pool';

import { pgType } from '../models/table.model';

import TotalServico from '../models/totalServico.model';
import Imposto from '../models/imposto.model';
import Retencao from '../models/retencao.model';

export default class TotalServicoPool extends Pool {
  totalServico : TotalServico;
  imposto : Imposto;
  retencao : Retencao;

  constructor(totalServico : TotalServico, imposto : Imposto, retencao : Retencao) {
    super([totalServico, imposto, retencao]);
    this.totalServico = totalServico;
    this.imposto = imposto;
    this.retencao = retencao;
  }

  async save() {
    const retencaoId = await this.retencao.save();
    const impostoId = await this.imposto.save();

    this.totalServico.impostoId = <number> impostoId;
    this.totalServico.retencaoId = <number> retencaoId;

    return this.totalServico.save();
  }

  async del() {
    await this.imposto.del();
    await this.retencao.del();
    return this.totalServico.del();
  }

  soma(pool : ServicoPool | TotalServicoPool) {
    if (pool instanceof ServicoPool) {
      this.totalServico.soma(pool.servico);
    } else if (pool instanceof TotalServicoPool) {
      this.totalServico.soma(pool.totalServico);
    }
    this.imposto.soma(pool.imposto);
    this.retencao.soma(pool.retencao);
  }

  static async getById(id : pgType) : Promise<TotalServicoPool> {
    const [totalServico] = await TotalServico.getBy({ id });
    if (totalServico) {
      const [[imposto], [retencao]] = await Promise.all([
        Imposto.getBy('id', totalServico.impostoId.toString()),
        Retencao.getBy('id', totalServico.retencaoId.toString()),
      ]);
      return new TotalServicoPool(totalServico, imposto, retencao);
    }

    return null;
  }
}
