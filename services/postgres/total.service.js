const { Pessoa } = require('../../models');

const {
  pegarMovimentosPoolMes,
} = require('./movimento.service');

const {
  pegarNotaChave,
} = require('./nota.service');

const {
  pegarServicosPoolMes,
} = require('./servico.service');

const {
  pegarEmpresaAliquota,
} = require('./aliquota.service');

const {
  calculaImpostosEmpresa,
} = require('../impostos.service');

const {
  TotalMovimento,
  TotalServico,
  Imposto,
  Icms,
  Retencao,
} = require('./models');
const { TotalPool, TotalMovimentoPool, TotalServicoPool, ImpostoPool } = require('./pools');


function criarTotais(cnpj, totais) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Totais').then((pessoaParam) => {
      const pessoa = pessoaParam;
      pessoa.Totais = pessoa.Totais.concat(totais);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function gravarTotais(cnpj, dados, compObj) {
  const mes = parseInt(compObj.mes, 10) - 1;
  const ano = parseInt(compObj.ano, 10);

  const competencia = new Date(ano, mes, 1);

  const totais = { ...dados, competencia };

  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Totais')
      .then((pessoaParam) => {
        const pessoa = pessoaParam;
        const totaisArray = pessoa.Totais;

        const checkComp = totaisArray.findIndex((el) => {
          const elComp = el.competencia;
          const elMes = elComp.getMonth();
          const elAno = elComp.getFullYear();

          return mes === elMes && ano === elAno;
        });

        if (checkComp !== -1) {
          pessoa.Totais[checkComp] = totais;
        } else {
          pessoa.Totais.push(totais);
        }


        pessoa.save().then(() => resolve()).catch(err => reject(err));
      }).catch(err => reject(err));
  });
}

function pegarTotalPool(cnpj, competencia) {
  return TotalPool.getByCnpjComp(cnpj, competencia, 1);
}

function getTrimestre(mes) {
  mes = parseInt(mes, 10);
  if ((mes - 1) % 3 === 0) return [mes];
  else if ((mes - 2) % 3 === 0) return [mes - 1, mes];
  return [mes - 2, mes - 1, mes];
}

async function calcularTotalMes(cnpj, competencia) {
  const [{ totalMovimentoPool, movimentosPool },
    { totalServicoPool, servicosPool }] = await Promise.all([
    new Promise(async (resolve) => {
      const movsPool = await pegarMovimentosPoolMes(cnpj, competencia);
      const totalMovPool = new TotalMovimentoPool(
        new TotalMovimento(),
        new ImpostoPool(new Imposto(), new Icms()),
      );

      movsPool.forEach(movimentoPool => totalMovPool.soma(movimentoPool));
      resolve({ totalMovimentoPool: totalMovPool, movimentosPool: movsPool });
    }),
    new Promise(async (resolve) => {
      const servsPool = await pegarServicosPoolMes(cnpj, competencia);
      const totalServPool = new TotalServicoPool(new TotalServico(), new Imposto(), new Retencao());

      servsPool.forEach(servicoPool => totalServPool.soma(servicoPool));
      resolve({ totalServicoPool: totalServPool, servicosPool: servsPool });
    }),
  ]);

  const totalPool = await TotalPool.newByPools(
    totalMovimentoPool,
    totalServicoPool,
    cnpj,
    new Date(competencia.ano, competencia.mes - 1),
    1,
  );

  return {
    totalPool,
    movimentosPool,
    servicosPool,
  };
}

async function calcularTotalTrimestre(cnpj, competencia) {
  const trimestreData = {
    servicosPool: [],
    movimentosPool: [],
  };

  const meses = getTrimestre(competencia.mes);

  const mesesPromise = meses.map(mes => calcularTotalMes(cnpj, { mes, ano: competencia.ano }));

  const mesesPool = await Promise.all(mesesPromise);

  const totalMovimentoPoolTrimestre = new TotalMovimentoPool(
    new TotalMovimento(),
    new ImpostoPool(new Imposto(), new Icms()),
  );
  const totalServicoPoolTrimestre = new TotalServicoPool(
    new TotalServico(),
    new Imposto(),
    new Retencao(),
  );

  mesesPool.forEach((mesPool, index) => {
    const mesNum = meses[index];
    const { totalPool } = mesPool;
    const { totalMovimentoPool, totalServicoPool } = totalPool;
    totalMovimentoPoolTrimestre.soma(totalMovimentoPool);
    totalServicoPoolTrimestre.soma(totalServicoPool);

    trimestreData[mesNum] = totalPool;
    trimestreData.movimentosPool = trimestreData.movimentosPool.concat(mesPool.movimentosPool);
    trimestreData.servicosPool = trimestreData.servicosPool.concat(mesPool.servicosPool);
  });

  const totalPoolTrimestre = await TotalPool.newByPools(
    totalMovimentoPoolTrimestre,
    totalServicoPoolTrimestre,
    cnpj,
    new Date(competencia.ano, competencia.mes - 1),
    3,
  );

  trimestreData.trim = totalPoolTrimestre;

  return trimestreData;
}

function pegarMovimentosServicosTotal(cnpj, competencia, recalcular) {
  return new Promise((resolveEnd, rejectEnd) => {
    const data = {};
    const notas = {};

    const promises = [];

    promises.push(new Promise((resolveMovs) => {
      pegarMovimentosMes(cnpj, competencia).then((movs) => {
        data.movimentos = movs;
        const movsPromises = [];
        movs.forEach((m) => {
          movsPromises.push(new Promise((resolveMov) => {
            pegarNotaChave(m.notaInicial).then((n1) => {
              pegarNotaChave(m.notaFinal).then((n2) => {
                notas[n1.chave] = n1;
                notas[n2.chave] = n2;
                data.notas = notas;
                resolveMov();
              }).catch(err => rejectEnd(err));
            }).catch(err => rejectEnd(err));
          }));
        });

        Promise.all(movsPromises).then(() => resolveMovs());
      }).catch(err => rejectEnd(err));
    }));
    promises.push(new Promise((resolveServs) => {
      pegarServicosMes(cnpj, competencia).then((servs) => {
        data.servicos = servs;
        resolveServs();
      }).catch((err) => { data.err = err; });
    }));

    Promise.all(promises).then(() => {
      totaisTrimestrais(cnpj, competencia, recalcular).then((trim) => {
        data.trimestre = trim;
        resolveEnd(data);
      }).catch(err => rejectEnd(err));
    }).catch(err => rejectEnd(err));
  });
}

// pegarTotalPool('06914971000123', { mes: 1, ano: 2019 }).then(a => console.log(a));

calcularTotalTrimestre('06914971000123', { mes: 3, ano: 2019 }).then(a => console.log(a));

module.exports = {
  criarTotais,
  gravarTotais,
  pegarTotalPool,
  // totaisTrimestrais,
  pegarMovimentosServicosTotal,
};
