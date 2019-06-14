const {
  cfopDevolucao,
  cfopDevolucaoConsignacao,
  cfopDevolucaoDemonstracao,
} = require('.');

const {
  TotalMovimento,
  Imposto,
  Icms,
  Retencao,
  TotalServico,
  Nota,
  NotaServico,
  Aliquota,
  Movimento,
  Servico,
  MetaDados,
  DifalAliquota,
} = require('./postgres/models');

const {
  TotalPool,
  TotalMovimentoPool,
  ImpostoPool,
  TotalServicoPool,
  MovimentoPool,
  ServicoPool,
} = require('./postgres/pools');

const {
  pegarMovimentosPoolMes,
  pegarServicosPoolMes,
  pegarMesTotalPool,
  pegarTrimestreTotalPool,
} = require('./postgres');

const {
  trim,
} = require('.');

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

async function calcularServicoPool(chaveNotaServico) {
  const [nota] = await NotaServico.getBy('chave', chaveNotaServico);
  const {
    emitenteCpfcnpj,
    status,
    dataHora,
    valor,
  } = nota;

  const servico = new Servico();

  servico.donoCpfcnpj = emitenteCpfcnpj;
  servico.notaChave = chaveNotaServico;
  servico.dataHora = dataHora;
  servico.valor = valor;

  if (status === 'CANCELADA') {
    return new ServicoPool(servico, new MetaDados(), new Imposto(), new Retencao());
  }

  const servicoPool = new ServicoPool(
    servico,
    new MetaDados(),
    new Imposto(),
    new Retencao(),
  );

  const [aliquota] = await Aliquota.getBy({ donoCpfcnpj: emitenteCpfcnpj, ativo: true });

  if (aliquota.tributacao === 'SN') {
    throw new Error('Simples Nacional não suportado!');
  }

  aliquota.irpj = 0.048;
  aliquota.csll = 0.0288;

  const impostoLista = ['iss', 'pis', 'cofins', 'irpj', 'csll'];

  await Promise.all([
    new Promise(async (resolve) => {
      const { imposto } = servicoPool;
      impostoLista.forEach((impostoNome) => {
        const val = aliquota[impostoNome] * nota.valor;
        imposto[impostoNome] = val;
        imposto.total += val;
      });
      resolve();
    }),
    new Promise(async (resolve) => {
      const [retencao] = await Retencao.getBy({ id: nota.retencaoId });
      servicoPool.retencao = retencao;
      resolve();
    }),
  ]);

  return servicoPool;
}

function eMovimentoInterno(nota) {
  return nota.estadoGeradorId === nota.estadoDestinoId;
}

function eDestinatarioContribuinte(nota) {
  return nota.destinatario_contribuinte === '1';
}

function eDevolucao(nota) {
  return cfopDevolucao.includes(nota.cfop);
}

function eDevolucaoConsigOuDemo(nota) {
  return cfopDevolucaoConsignacao.includes(nota.cfop) ||
  cfopDevolucaoDemonstracao.includes(nota.cfop);
}

async function calcularMovimentoPool(notaInicialChave, notaFinalChave) {
  const [notaFinal] = await Nota.getBy({ chave: notaFinalChave });

  if (notaFinal.estadoGeradorId !== 11) throw new Error('Estado informado não suportado!');

  const [notaInicial] = notaInicialChave ? await Nota.getBy({ chave: notaInicialChave }) : [null];

  const movimento = new Movimento();
  const metaDados = new MetaDados();
  const imposto = new Imposto();
  const icms = new Icms();

  const movimentoPool = new MovimentoPool(
    movimento,
    metaDados,
    new ImpostoPool(imposto, icms),
  );
  metaDados.mdDataHora = new Date();
  metaDados.ativo = true;
  metaDados.tipo = 'PRIM';

  movimento.notaFinalChave = notaFinalChave;
  movimento.notaInicialChave = notaInicialChave;
  movimento.dataHora = notaFinal.dataHora;
  movimento.conferido = true;
  movimento.valorSaida = notaFinal.valor;
  movimento.donoCpfcnpj = notaFinal.emitenteCpfcnpj;
  movimento.lucro = notaInicial ? notaFinal.valor - notaInicial.valor : notaFinal.valor;

  if (movimento.lucro < 0 && !eMovimentoInterno(notaFinal)) {
    movimento.lucro = 0;
  }

  if ((movimento.lucro <= 0 && !eDevolucao(notaFinal)) || eDevolucaoConsigOuDemo(notaFinal)) {
    movimento.lucro = 0;
    return movimentoPool;
  }

  if (eDevolucao(notaFinal) && notaInicial) {
    const movimentoAnterior = await MovimentoPool.getByNotaFinal(notaInicialChave);
    movimento.lucro = movimentoAnterior ? (-1) * movimentoAnterior.lucro : 0;
    movimento.valorSaida = 0;
  }

  const impostosFederais = ['pis', 'cofins', 'csll', 'irpj'];
  const [aliquota] = await Aliquota.getBy({ donoCpfcnpj: movimento.donoCpfcnpj, ativo: true });

  impostosFederais.forEach((impostoNome) => {
    const valor = movimento.lucro * aliquota[impostoNome];
    imposto[impostoNome] = valor;
    imposto.total += valor;
  });

  if (eMovimentoInterno(notaFinal)) {
    icms.baseDeCalculo = movimento.lucro * aliquota.icmsReducao;
    icms.proprio = movimento.lucro * aliquota.icmsReducao * aliquota.icmsAliquota;
    imposto.total += icms.proprio;
    return movimentoPool;
  }

  const { estadoDestinoId } = notaFinal;

  const [difalAliquota] = await DifalAliquota.getBy({ estadoId: estadoDestinoId });

  if (!difalAliquota) throw new Error('Estado não suportado!');

  if (eDestinatarioContribuinte(notaFinal)) {
    icms.baseDeCalculo = 0.05 * movimento.valorSaida;
    icms.proprio = icms.baseDeCalculo * difalAliquota.externo;

    imposto.total += icms.proprio;
  } else {
    const estadosSemReducao = [20/* RN */, 5/* BA */, 23/* RS */, 27/* TO */];
    const composicaoDaBase = movimento.valorSaida;
    const baseDeCalculo = 0.05 * composicaoDaBase;
    const baseDifal = estadosSemReducao.includes(estadoDestinoId) ?
      composicaoDaBase : baseDeCalculo;
    const proprio = baseDifal * difalAliquota.externo;
    const difal = (baseDifal * difalAliquota.interno) - proprio;

    icms.composicaoDaBase = composicaoDaBase;
    icms.baseDeCalculo = baseDeCalculo;
    icms.proprio = proprio;
    icms.difalOrigem = 0;
    icms.difalDestino = difal;

    imposto.total += difal + proprio;
  }

  return movimentoPool;
}

module.exports = {
  pegarTrimestreComNotas,
  calcularTrimestre,
  calcularServicoPool,
  calcularMovimentoPool,
};
