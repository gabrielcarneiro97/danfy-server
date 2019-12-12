const {
  Simples,
  Nota,
  NotaServico,
} = require('./postgres/models');

const {
  ultimosDoze,
  mesesExercicio,
  compToStr,
  strToComp,
  dateToComp,
  compToDate,
} = require('./calculador.service');

const { pegarMovimentosServicosMes } = require('./impostos.service');

async function pegarSimplesData(cnpj, competencia) {
  const simplesData = await pegarMovimentosServicosMes(cnpj, competencia);
  simplesData.simples = await Simples.getByCnpjComp(cnpj, competencia);

  return simplesData;
}

async function pegarSimplesComNotas(cnpj, competencia) {
  const simplesData = await pegarSimplesData(cnpj, competencia);

  const { movimentosPool, servicosPool } = simplesData;

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
    simplesData,
    notasPool,
    notasServicoPool,
  };
}

async function calcularSimples(cnpj, competencia) {
  const simplesData = await pegarMovimentosServicosMes(cnpj, competencia);

  const totalMovimentos = simplesData.movimentosPool.reduce(
    (acc, crr) => acc + crr.movimento.lucro,
    0,
  );

  const totalRetido = simplesData.servicosPool.reduce(
    (acc, crr) => {
      if (crr.retencao.iss) {
        return acc + crr.servico.valor;
      }
      return acc;
    },
    0,
  );

  const totalNaoRetido = simplesData.servicosPool.reduce(
    (acc, crr) => {
      if (!crr.retencao.iss) {
        return acc + crr.servico.valor;
      }
      return acc;
    },
    0,
  );

  const totalServicos = totalRetido + totalNaoRetido;

  const totalMes = totalMovimentos + totalServicos;

  const mesesEx = mesesExercicio(competencia);
  const ultimos12 = ultimosDoze(competencia);

  const meses = Array.from(
    new Set(
      mesesEx.map(compToStr)
        .concat(ultimos12.map(compToStr)),
    ),
  ).map(strToComp);

  const todosSimples = await Promise.all(
    meses.map(async (comp) => Simples.getByCnpjComp(cnpj, comp)),
  );

  const totalExercicio = todosSimples.reduce((acc, crr) => {
    if (!crr
      || dateToComp(crr.dataHora).ano !== parseInt(competencia.ano, 10)
      || dateToComp(crr.dataHora).mes >= parseInt(competencia.mes, 10)) return acc;
    return acc + crr.totalMes;
  }, totalMes);

  const totalDoze = todosSimples.reduce((acc, crr) => {
    if (!crr
      || (dateToComp(crr.dataHora).mes >= parseInt(competencia.mes, 10)
      && dateToComp(crr.dataHora).ano === parseInt(competencia.ano, 10))) return acc;
    return acc + crr.totalMes;
  }, 0);

  return new Simples({
    donoCpfcnpj: cnpj,
    dataHora: compToDate(competencia),
    totalMovimentos,
    totalServicos,
    totalRetido,
    totalNaoRetido,
    totalMes,
    totalExercicio,
    totalDoze,
  });
}

async function recalcularSimples(cnpj, competencia) {
  const onDb = await Simples.getByCnpjComp(cnpj, competencia);
  const novo = await calcularSimples(cnpj, competencia);

  if (onDb) onDb.del();

  await novo.save();

  return novo;
}

module.exports = {
  calcularSimples,
  recalcularSimples,
  pegarSimplesData,
  pegarSimplesComNotas,
};
