const {
  Movimento,
  Imposto,
  MetaDados,
  Icms,
} = require('./models');
const {
  MovimentoPool,
} = require('./pools');
const { pg } = require('../pg.service');
const { mesInicioFim } = require('../calculador.service');


async function criarMovimento(movPool) {
  return movPool.save();
}

async function pegarMovimentosPoolMes(cnpj, competencia) {
  const mes = mesInicioFim(competencia);

  const select = str => pg.select(str)
    .from('tb_movimento as mov')
    .where('mov.dono_cpfcnpj', cnpj)
    .andWhere('md.ativo', true)
    .andWhere('mov.data_hora', '<=', mes.fim)
    .andWhere('mov.data_hora', '>=', mes.inicio);

  return new Promise((resolve, reject) => {
    const movPromise = select('mov.*').innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id');
    const mdPromise = select('md.*').innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id');
    const impPromise = select('imp.*')
      .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id')
      .innerJoin('tb_imposto as imp', 'mov.imposto_id', 'imp.id');
    const icmsPromise = select('icms.*')
      .innerJoin('tb_imposto as imp', 'mov.imposto_id', 'imp.id')
      .innerJoin('tb_icms as icms', 'imp.icms_id', 'icms.id')
      .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id');

    Promise.all([
      movPromise,
      mdPromise,
      impPromise,
      icmsPromise,
    ]).then(([movsPg, metaDadosPg, impostosPg, icmsPg]) => {
      const movimentosArr = movsPg.map(o => new Movimento(o, true));
      const metaDadosArr = metaDadosPg.map(o => new MetaDados(o, true));
      const impostoArr = impostosPg.map(o => new Imposto(o, true));
      const icmsArr = icmsPg.map(o => new Icms(o, true));

      const endArr = movimentosArr.map((movimento) => {
        const metaDados = metaDadosArr.find(o => o.mdId === movimento.metaDadosId);
        const imposto = impostoArr.find(o => o.id === movimento.impostoId);
        const icms = icmsArr.find(o => o.id === imposto.icmsId);

        return new MovimentoPool(
          movimento,
          metaDados,
          imposto,
          icms,
        );
      });

      resolve(endArr);
    }).catch(reject);
  });
}

async function pegarMovimentoPoolId(id) {
  const [movimento] = await Movimento.getBy({ id });
  const [metaDados] = await MetaDados.getBy({ mdId: movimento.metaDadosId });
  const [imposto] = await Imposto.getBy({ id: movimento.impostoId });
  const [icms] = await Icms.getBy({ id: imposto.icmsId });

  return new MovimentoPool(movimento, metaDados, imposto, icms);
}

async function pegarMovimentoPoolNotaFinal(chaveNota) {
  const [mov] = await pg.select('mov.id')
    .from('tb_movimento as mov')
    .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id')
    .where('md.ativo', true)
    .andWhere('nota_final_chave', chaveNota);
  return pegarMovimentoPoolId(mov.id);
}

async function pegarMetaDados(movId) {
  const [movimento] = await Movimento.getBy({ id: movId });
  const [metaDados] = await MetaDados.getBy({ mdId: movimento.metaDadosId });

  return metaDados;
}

async function cancelarMovimento(id) {
  const metaDados = pegarMetaDados(id);
  metaDados.ativo = false;
  return metaDados.save();
}

module.exports = {
  criarMovimento,
  pegarMovimentoPoolNotaFinal,
  pegarMovimentosPoolMes,
  pegarMovimentoPoolId,
  cancelarMovimento,
};
