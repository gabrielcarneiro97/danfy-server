const {
  pegarMovimentosPoolMes,
} = require('./movimento.service');

const {
  pegarServicosPoolMes,
} = require('./servico.service');

const {
  Nota,
  NotaServico,
  TotalMovimento,
  TotalServico,
  Imposto,
  Icms,
  Retencao,
} = require('./models');

const {
  TotalPool,
  TotalMovimentoPool,
  TotalServicoPool,
  ImpostoPool,
} = require('./pools');

function trim(mes) {
  mes = parseInt(mes, 10);
  if ((mes - 1) % 3 === 0) return [mes];
  else if ((mes - 2) % 3 === 0) return [mes - 1, mes];
  return [mes - 2, mes - 1, mes];
}

function gravarTotalPool(totalPool) {
  return totalPool.save();
}

async function pegarMovimentosServicosMes(cnpj, competencia) {
  const [movimentosPool, servicosPool] = await Promise.all([
    pegarMovimentosPoolMes(cnpj, competencia),
    pegarServicosPoolMes(cnpj, competencia),
  ]);

  return {
    movimentosPool,
    servicosPool,
  };
}

function pegarMesTotalPool(cnpj, competencia) {
  return TotalPool.getByCnpjComp(cnpj, competencia, 1);
}

async function calcularMes(cnpj, competencia) {
  const { movimentosPool, servicosPool } = await pegarMovimentosServicosMes(cnpj, competencia);

  const totalMovimentoPool = new TotalMovimentoPool(
    new TotalMovimento(),
    new ImpostoPool(new Imposto(), new Icms()),
  );

  movimentosPool.forEach(movimentoPool => totalMovimentoPool.soma(movimentoPool));

  const totalServicoPool = new TotalServicoPool(new TotalServico(), new Imposto(), new Retencao());

  servicosPool.forEach(servicoPool => totalServicoPool.soma(servicoPool));

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

async function pegarMes(cnpj, competencia) {
  const totalPool = await pegarMesTotalPool(cnpj, competencia);

  if (!totalPool) {
    return calcularMes(cnpj, competencia);
  }
  const { movimentosPool, servicosPool } = await pegarMovimentosServicosMes(cnpj, competencia);

  return {
    totalPool,
    movimentosPool,
    servicosPool,
  };
}

function pegarTrimestreTotalPool(cnpj, competencia) {
  return TotalPool.getByCnpjComp(cnpj, competencia, 3);
}

async function calcularTrimestre(cnpj, competencia) {
  const trimestreData = {
    servicosPool: [],
    movimentosPool: [],
  };

  const meses = trim(competencia.mes);

  const mesesPromise = meses.map(mes => calcularMes(cnpj, { mes, ano: competencia.ano }));

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

async function pegarTrimestre(cnpj, competencia) {
  const trimestreTotalPool = await pegarTrimestreTotalPool(cnpj, competencia);

  if (!trimestreTotalPool) {
    const trimestreData = await calcularTrimestre(cnpj, competencia);
    return trimestreData;
  }
  const trimestreData = {
    servicosPool: [],
    movimentosPool: [],
    trim: trimestreTotalPool,
  };

  const meses = trim(competencia.mes);

  const mesesPromise = meses.map(mes => pegarMes(cnpj, { mes, ano: competencia.ano }));

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
    new Promise(async (resolve) => {
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

      resolve(notasIniciais.concat(notasFinais));
    }),
    new Promise(async (resolve) => {
      const notasServico = await Promise.all(servicosPool.map(async (servicoPool) => {
        const { notaChave: chave } = servicoPool.servico;
        const [nota] = await NotaServico.getBy({ chave });
        return nota;
      }));

      resolve(notasServico);
    }),
  ]);

  return {
    trimestreData,
    notasPool,
    notasServicoPool,
  };
}

module.exports = {
  gravarTotalPool,
  pegarMes,
  calcularMes,
  pegarTrimestre,
  calcularTrimestre,
  pegarTrimestreComNotas,
};
