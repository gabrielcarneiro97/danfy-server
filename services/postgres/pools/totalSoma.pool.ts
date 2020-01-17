import Pool from './pool';
import ImpostoPool from './imposto.pool';

import TotalSoma from '../models/totalSoma.model';
import Retencao from '../models/retencao.model';
import Acumulado from '../models/acumulado.model';
import { pgType } from '../models/table.model';

export default class TotalSomaPool extends Pool {
  totalSoma : TotalSoma;
  impostoPool : ImpostoPool;
  retencao : Retencao;
  acumulado : Acumulado;

  constructor(totalSoma : TotalSoma,
    impostoPool : ImpostoPool,
    retencao : Retencao,
    acumulado : Acumulado) {
    super([totalSoma, impostoPool, retencao, acumulado]);
    this.totalSoma = totalSoma;
    this.impostoPool = impostoPool;
    this.retencao = retencao;
    this.acumulado = acumulado;
  }

  async save() {
    const impostoId = await this.impostoPool.save();
    const retencaoId = await this.retencao.save();
    const acumuladoId = await this.acumulado.save();

    this.totalSoma.impostoId = <number> impostoId;
    this.totalSoma.retencaoId = <number> retencaoId;
    this.totalSoma.acumuladoId = <number> acumuladoId;

    return this.totalSoma.save();
  }

  static async getById(id : pgType) {
    const [totalSoma] = await TotalSoma.getBy({ id });
    if (totalSoma) {
      const impostoPool = await ImpostoPool.getById(totalSoma.impostoId);
      const [retencao] = await Retencao.getBy('id', totalSoma.retencaoId.toString());
      const [acumulado] = await Acumulado.getBy('id', totalSoma.acumuladoId.toString());
      return new TotalSomaPool(totalSoma, impostoPool, retencao, acumulado);
    }

    return null;
  }

  async del() {
    await this.impostoPool.del();
    await this.retencao.del();
    await this.acumulado.del();
    return this.totalSoma.del();
  }
}
