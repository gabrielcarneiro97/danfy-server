const Pool = require('./pool');
const TotalMovimentoPool = require('./totalMovimento.pool');
const TotalServicoPool = require('./totalServico.pool');
const TotalSomaPool = require('./totalSoma.pool');

const {
  Total,
  TotalSoma,
  Imposto,
  Retencao,
  Acumulado,
  Icms,
} = require('../models');
const { mesInicioFim } = require('../../calculador.service');
const { pg } = require('../../pg.service');

class TotalPool extends Pool {
  constructor(total, totalMovimentoPool, totalServicoPool, totalSomaPool) {
    super([total, totalMovimentoPool, totalServicoPool, totalSomaPool]);
    this.total = total;
    this.totalMovimentoPool = totalMovimentoPool;
    this.totalServicoPool = totalServicoPool;
    this.totalSomaPool = totalSomaPool;
  }

  async save() {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.totalMovimentoPool.save(),
        this.totalServicoPool.save(),
        this.totalSomaPool.save(),
      ]).then(([
        totalMovimentoId,
        totalServicoId,
        totalSomaId,
      ]) => {
        this.total.totalMovimentoId = totalMovimentoId;
        this.total.totalServicoId = totalServicoId;
        this.total.totalSomaId = totalSomaId;

        this.total.save().then(resolve).catch(reject);
      }).catch(reject);
    });
  }

  static async getByCnpjComp(cnpj, comp, tipo) {
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
          return select().andWhere('total.anual', false).orWhere('total.anual', null).andWhere('total.trimestral', false)
            .orWhere('total.trimestral', null);
      }
    };
    const [totalPg] = await getTotal();
    const total = new Total(totalPg, true);

    return new Promise((resolve, reject) => {
      Promise.all([
        TotalMovimentoPool.getById(total.totalMovimentoId),
        TotalServicoPool.getById(total.totalServicoId),
        TotalSomaPool.getById(total.totalSomaId),
      ]).then(([totalMovimentoPool, totalServicoPool, totalSomaPool]) => {
        resolve(new TotalPool(total, totalMovimentoPool, totalServicoPool, totalSomaPool));
      }).catch(reject);
    });
  }

  static newByPools(totalMovimentoPool, totalServicoPool, donoCpfCnpj, dataHora, tipo) {
    const total = new Total();
    total.donoCpfcnpj = donoCpfCnpj;
    total.dataHora = dataHora;
    total.anual = tipo === 12;
    total.trimestral = tipo === 3;

    const totalSoma = new TotalSoma();
    totalSoma.valorMovimento = totalMovimentoPool.totalMovimento.lucro;
    totalSoma.valorServico = totalServicoPool.totalServico.total;
    const impostoTotalSoma = new Imposto();
    impostoTotalSoma.soma(totalMovimentoPool.imposto);
    impostoTotalSoma.soma(totalServicoPool.imposto);
    const icmsTotalSoma = new Icms();
    icmsTotalSoma.soma(totalMovimentoPool.icms);
    const retencaoTotalSoma = new Retencao();
    retencaoTotalSoma.soma(totalServicoPool.retencao);
    const acumuladoTotalSoma = new Acumulado();

    const totalSomaPool = new TotalSomaPool(
      totalSoma,
      impostoTotalSoma,
      icmsTotalSoma,
      retencaoTotalSoma,
      acumuladoTotalSoma,
    );

    return new TotalPool(total, totalMovimentoPool, totalServicoPool, totalSomaPool);
  }
}

module.exports = TotalPool;
