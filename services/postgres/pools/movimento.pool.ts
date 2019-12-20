import Pool from './pool';
import { pg } from '../../pg.service';
import ImpostoPool from './imposto.pool';

import {
  pgType, // eslint-disable-line no-unused-vars
} from '../models/table.model';
import Movimento from '../models/movimento.model';
import MetaDados from '../models/metaDados.model';

export default class MovimentoPool extends Pool {
  movimento : Movimento;
  metaDados : MetaDados;
  impostoPool : ImpostoPool;

  constructor(movimento : Movimento, metaDados : MetaDados, impostoPool : ImpostoPool) {
    super([movimento, metaDados, impostoPool]);
    this.movimento = movimento;
    this.metaDados = metaDados;
    this.impostoPool = impostoPool;
  }

  static async getById(id : pgType) {
    const [movimento] = await Movimento.getBy({ id });
    const [impostoPool, [metaDados]] = await Promise.all([
      ImpostoPool.getById(movimento.impostoId),
      MetaDados.getBy({ mdId: movimento.metaDadosId }),
    ]);

    return new MovimentoPool(movimento, metaDados, impostoPool);
  }

  static async getByNotaFinal(notaChave : pgType) {
    const [movimentoPg] = await pg.table('tb_movimento')
      .innerJoin('tb_meta_dados', 'tb_movimento.meta_dados_id', 'tb_meta_dados.md_id')
      .where('tb_movimento.nota_final_chave', notaChave)
      .andWhere('tb_meta_dados.ativo', true);

    if (movimentoPg) {
      const movimento = new Movimento(movimentoPg, true);
      const [impostoPool, [metaDados]] = await Promise.all([
        ImpostoPool.getById(movimento.impostoId),
        MetaDados.getBy({ mdId: movimento.metaDadosId }),
      ]);

      return new MovimentoPool(movimento, metaDados, impostoPool);
    }

    return null;
  }

  async save() {
    const impostoId = await this.impostoPool.save();
    const metaDadosId = await this.metaDados.save();
    this.movimento.impostoId = <number> impostoId;
    this.movimento.metaDadosId = <number> metaDadosId;

    return this.movimento.save();
  }
}
