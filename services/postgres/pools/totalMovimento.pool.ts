import Pool from './pool';
import ImpostoPool from './imposto.pool';
import MovimentoPool from './movimento.pool';

import TotalMovimento from '../models/totalMovimento.model';
import { pgType } from '../models/table.model'; // eslint-disable-line no-unused-vars

export default class TotalMovimentoPool extends Pool {
  totalMovimento : TotalMovimento;
  impostoPool : ImpostoPool;

  constructor(totalMovimento : TotalMovimento, impostoPool : ImpostoPool) {
    super([totalMovimento, impostoPool]);
    this.totalMovimento = totalMovimento;
    this.impostoPool = impostoPool;
  }

  soma(pool : MovimentoPool | TotalMovimentoPool) {
    if (pool instanceof MovimentoPool) {
      this.totalMovimento.soma(pool.movimento);
    } else if (pool instanceof TotalMovimentoPool) {
      this.totalMovimento.soma(pool.totalMovimento);
    }
    this.impostoPool.soma(pool.impostoPool);
  }

  async save() {
    const impostoId = await this.impostoPool.save();
    this.totalMovimento.impostoId = <number> impostoId;

    return this.totalMovimento.save();
  }

  async del() {
    await this.impostoPool.del();
    return this.totalMovimento.del();
  }

  static async getById(id : pgType) {
    const [totalMovimento] = await TotalMovimento.getBy({ id });
    if (totalMovimento) {
      const impostoPool = await ImpostoPool.getById(totalMovimento.impostoId);
      return new TotalMovimentoPool(totalMovimento, impostoPool);
    }
    return null;
  }
}
