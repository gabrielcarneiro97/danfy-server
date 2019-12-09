const {
  TotalMovimento,
  Imposto,
  Icms,
  Retencao,
  TotalServico,
  Nota,
  NotaServico,
  Aliquota,
} = require('./postgres/models');

const {
  TotalPool,
  TotalMovimentoPool,
  ImpostoPool,
  TotalServicoPool,
} = require('./postgres/pools');

const { pegarMes, calcularMes } = require('./impostos.service');

const { pegarTrimestreTotalPool } = require('./postgres/total.service');

const {
  trim,
  getMesTrim,
} = require('.');

async function calcularTrimestre(cnpj, competencia) {
  const trimestreData = {
    servicosPool: [],
    movimentosPool: [],
  };

  const meses = trim(competencia.mes);

  const mesesPromise = meses.map(async (mes) => calcularMes(cnpj, { mes, ano: competencia.ano }));

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

  const [{ irpj: aliquotaIr }] = await Aliquota.getBy('dono_cpfcnpj', cnpj);

  const mesTrim = getMesTrim(competencia.mes);

  const totalPoolTrimestre = await TotalPool.newByPools(
    totalMovimentoPoolTrimestre,
    totalServicoPoolTrimestre,
    cnpj,
    new Date(competencia.ano, mesTrim - 1),
    3,
    aliquotaIr,
  );

  trimestreData.trim = totalPoolTrimestre;

  return trimestreData;
}

async function pegarTrimestre(cnpj, competencia) {
  const trimestreTotalPool = await pegarTrimestreTotalPool(cnpj, competencia);

  if (!trimestreTotalPool) {
    const trimestreData = await calcularTrimestre(cnpj, competencia);
    await trimestreData.trim.save();
    return trimestreData;
  }
  const trimestreData = {
    servicosPool: [],
    movimentosPool: [],
    trim: trimestreTotalPool,
  };

  const meses = trim(competencia.mes);

  const mesesPromise = meses.map((mes) => pegarMes(cnpj, { mes, ano: competencia.ano }));

  const mesesPool = await Promise.all(mesesPromise);

  mesesPool.forEach((mesPool, index) => {
    const mesNum = meses[index];
    const { totalPool } = mesPool;
    trimestreData[mesNum] = totalPool;
    trimestreData.movimentosPool = trimestreData.movimentosPool.concat(mesPool.movimentosPool);
    trimestreData.servicosPool = trimestreData.servicosPool.concat(mesPool.servicosPool);
  });

  return trimestreData;
}

async function pegarTrimestreComNotas(cnpj, competencia) {
  const trimestreData = await pegarTrimestre(cnpj, competencia);
  const { movimentosPool, servicosPool } = trimestreData;

  const [notasPool, notasServicoPool] = await Promise.all([
    (async () => {
      const [notasIniciais, notasFinais] = await Promise.all([
        Promise.all(movimentosPool.map(async (movimentoPool) => {
          const { notaInicialChave: chave } = movimentoPool.movimento;
          const [nota] = await Nota.getBy({ chave });
          return nota;
        })),
        Promise.all(movimentosPool.map(async (movimentoPool) => {
          const { notaFinalChave: chave } = movimentoPool.movimento;
          const [nota] = await Nota.getBy({ chave });
          return nota;
        })),
      ]);

      return notasIniciais.concat(notasFinais);
    })(),
    (async () => {
      const notasServico = await Promise.all(servicosPool.map(async (servicoPool) => {
        const { notaChave: chave } = servicoPool.servico;
        const [nota] = await NotaServico.getBy({ chave });
        return nota;
      }));

      return notasServico;
    })(),
  ]);

  return {
    trimestreData,
    notasPool,
    notasServicoPool,
  };
}

async function recalcularTrimestre(cnpj, competencia) {
  const [trimDb, trimNovo] = await Promise.all([
    pegarTrimestre(cnpj, competencia),
    calcularTrimestre(cnpj, competencia),
  ]);

  delete trimDb.movimentosPool;
  delete trimDb.servicosPool;

  await Promise.all(Object.keys(trimDb).map(async (key) => trimDb[key].del()));
  await Promise.all(Object.keys(trimNovo).map(async (key) => {
    if (key !== 'movimentosPool' && key !== 'servicosPool') {
      return trimNovo[key].save();
    }
    return true;
  }));

  return trimNovo;
}

module.exports = {
  pegarTrimestre,
  pegarTrimestreComNotas,
  calcularTrimestre,
  recalcularTrimestre,
};
