import { mesInicioFim, Comp } from '../../calculador.service'; // eslint-disable-line no-unused-vars
import { pg } from '../../pg.service';

import Pool from './pool';
import TotalMovimentoPool from './totalMovimento.pool';
import TotalServicoPool from './totalServico.pool';
import TotalSomaPool from './totalSoma.pool';
import ImpostoPool from './imposto.pool';

import Total from '../models/total.model';
import TotalSoma from '../models/totalSoma.model';
import Imposto from '../models/imposto.model';
import Retencao from '../models/retencao.model';
import Acumulado from '../models/acumulado.model';
import Icms from '../models/icms.model';
import { pgType } from '../models/table.model'; // eslint-disable-line no-unused-vars


export default class TotalPool extends Pool {
  total : Total;
  totalMovimentoPool : TotalMovimentoPool;
  totalServicoPool : TotalServicoPool;
  totalSomaPool : TotalSomaPool;

  constructor(total : Total,
    totalMovimentoPool : TotalMovimentoPool,
    totalServicoPool : TotalServicoPool,
    totalSomaPool : TotalSomaPool) {
    super([total, totalMovimentoPool, totalServicoPool, totalSomaPool]);
    this.total = total;
    this.totalMovimentoPool = totalMovimentoPool;
    this.totalServicoPool = totalServicoPool;
    this.totalSomaPool = totalSomaPool;
  }

  async save() {
    const [
      totalMovimentoId,
      totalServicoId,
      totalSomaId,
    ] = await Promise.all([
      this.totalMovimentoPool.save(),
      this.totalServicoPool.save(),
      this.totalSomaPool.save(),
    ]);

    this.total.totalMovimentoId = <number> totalMovimentoId;
    this.total.totalServicoId = <number> totalServicoId;
    this.total.totalSomaId = <number> totalSomaId;

    return this.total.save();
  }

  static async getByCnpjComp(cnpj : pgType, comp : Comp, tipo : number) {
    /* tipo = 1 (mensal), tipo = 3 (trimestral), tipo = 12 (anual) */
    const mes = mesInicioFim(comp);
    const getTotal = () => {
      const select = () => pg.select('*')
        .from('tb_total as total')
        .where('total.dono_cpfcnpj', cnpj)
        .andWhere('total.data_hora', '<=', mes.fim)
        .andWhere('total.data_hora', '>=', mes.inicio);

      switch (tipo) {
        case 12:
          return select().andWhere('total.anual', true);

        case 3:
          return select().andWhere('total.trimestral', true);

        case 1:
        default:
          return select().andWhereRaw('(total.anual = ? OR total.anual = ?) AND (total.trimestral = ? OR total.trimestral = ?)', [false, null, false, null]);
      }
    };
    const [totalPg, ...rest] = await getTotal();
    if (!totalPg) return null;
    const total = new Total(totalPg, true);

    if (rest && rest.length > 0) {
      const totais = rest.map((t) => new Total(t, true));
      await Promise.all(totais.map(async (t) => t.del()));
    }

    const [totalMovimentoPool, totalServicoPool, totalSomaPool] = await Promise.all([
      TotalMovimentoPool.getById(total.totalMovimentoId),
      TotalServicoPool.getById(total.totalServicoId),
      TotalSomaPool.getById(total.totalSomaId),
    ]);

    return new TotalPool(total, totalMovimentoPool, totalServicoPool, totalSomaPool);
  }

  static newByPools(totalMovimentoPool : TotalMovimentoPool,
    totalServicoPool : TotalServicoPool,
    donoCpfCnpj : string,
    dataHora : Date,
    tipo : number,
    aliquotaIr : number) {
    const total = new Total({});
    total.donoCpfcnpj = donoCpfCnpj;
    total.dataHora = dataHora;
    total.anual = tipo === 12;
    total.trimestral = tipo === 3;

    const totalSoma = new TotalSoma({});
    totalSoma.valorMovimento = totalMovimentoPool.totalMovimento.lucro;
    totalSoma.valorServico = totalServicoPool.totalServico.total;
    const impostoTotalSoma = new Imposto({});
    impostoTotalSoma.soma(totalMovimentoPool.impostoPool.imposto);
    impostoTotalSoma.soma(totalServicoPool.imposto);
    impostoTotalSoma.calculaAdicional(totalSoma.valorMovimento, totalSoma.valorServico, aliquotaIr);
    const icmsTotalSoma = new Icms({});
    icmsTotalSoma.soma(totalMovimentoPool.impostoPool.icms);
    const retencaoTotalSoma = new Retencao({});
    retencaoTotalSoma.soma(totalServicoPool.retencao);
    const acumuladoTotalSoma = new Acumulado({});

    const totalSomaPool = new TotalSomaPool(
      totalSoma,
      new ImpostoPool(impostoTotalSoma, icmsTotalSoma),
      retencaoTotalSoma,
      acumuladoTotalSoma,
    );

    return new TotalPool(total, totalMovimentoPool, totalServicoPool, totalSomaPool);
  }

  async del() {
    await this.totalSomaPool.del();
    await this.totalMovimentoPool.del();
    await this.totalServicoPool.del();
    return this.total.del();
  }
}
