const {
  Servico,
  MetaDados,
  Imposto,
  Retencao,
} = require('./models');
const { ServicoPool } = require('./pools');
const { pg } = require('../pg.service');
const { mesInicioFim } = require('../calculador.service');

function criarServico(servicoPool) {
  return servicoPool.save();
}

async function criarServicos(servicosPool) {
  return new Promise((resolve, reject) => {
    const promises = [];
    servicosPool.forEach(servicoPool => promises(servicoPool.save()));
    Promise.All(promises).then(resolve).catch(reject);
  });
}

function pegarServicosPoolMes(donoCpfcnpj, competencia) {
  const mes = mesInicioFim(competencia);

  const select = str => pg.select(str).from('tb_servico as serv')
    .where('serv.dono_cpfcnpj', donoCpfcnpj)
    .andWhere('serv.data_hora', '<=', mes.fim)
    .andWhere('serv.data_hora', '>=', mes.inicio);

  const servPromise = select('serv.*');
  const impPromise = select('imp.*').innerJoin('tb_imposto as imp', 'serv.imposto_id', 'imp.id');
  const retPromise = select('ret.*').innerJoin('tb_retencao as ret', 'serv.retencao_id', 'ret.id');
  const mdPromise = select('md.*').innerJoin('tb_meta_dados as md', 'serv.meta_dados_id', 'md.md_id');
  return new Promise((resolve, reject) => {
    Promise.all([
      servPromise,
      impPromise,
      retPromise,
      mdPromise,
    ]).then(([servsPg, impsPg, retsPg, metaDadosPg]) => {
      const servsArr = servsPg.map(o => new Servico(o, true));
      const impsArr = impsPg.map(o => new Imposto(o, true));
      const retsArr = retsPg.map(o => new Retencao(o, true));
      const metaDadosArr = metaDadosPg.map(o => new MetaDados(o, true));

      const finalArr = servsArr.map((servico) => {
        const metaDados = servico.metaDadosId ?
          metaDadosArr.find(o => o.mdId === servico.metaDadosId) : undefined;
        const imposto = impsArr.find(o => o.id === servico.impostoId);
        const retencao = retsArr.find(o => o.id === servico.retencaoId);

        return new ServicoPool(servico, metaDados, imposto, retencao);
      });

      resolve(finalArr);
    }).catch(reject);
  });
}

async function pegarServicoPoolId(id) {
  const [servico] = await Servico.getBy({ id });
  const [metaDados] = await MetaDados.getBy({ mdId: servico.metaDadosId });
  const [imposto] = await Imposto.getBy({ id: servico.impostoId });
  const [retencao] = await Retencao.getBy({ id: servico.retencaoId });

  return new ServicoPool(servico, metaDados, imposto, retencao);
}

async function pegarServicoPoolNota(notaChave) {
  const [servico] = await Servico.getBy({ notaChave });
  const [metaDados] = await MetaDados.getBy({ mdId: servico.metaDadosId });
  const [imposto] = await Imposto.getBy({ id: servico.impostoId });
  const [retencao] = await Retencao.getBy({ id: servico.retencaoId });

  return new ServicoPool(servico, metaDados, imposto, retencao);
}

async function excluirServico(servicoId) {
  const servicoPool = await pegarServicoPoolId(servicoId);
  return servicoPool.del();
}

module.exports = {
  criarServico,
  criarServicos,
  pegarServicosPoolMes,
  pegarServicoPoolId,
  pegarServicoPoolNota,
  excluirServico,
};
