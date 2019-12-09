const {
  Movimento,
  MetaDados,
  Imposto,
  Icms,
  DifalAliquota,
} = require('../../postgres/models');

const {
  MovimentoPool,
  ImpostoPool,
} = require('../../postgres/models');

const {
  cfopDevolucao,
  cfopDevolucaoConsignacao,
  cfopDevolucaoDemonstracao,
} = require('../../');

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
  return cfopDevolucaoConsignacao.includes(nota.cfop)
  || cfopDevolucaoDemonstracao.includes(nota.cfop);
}

async function calcularMovimentoPool(notaInicial, notaFinal, aliquota) {
  if (notaFinal.estadoGeradorId !== 11) throw new Error('Estado informado não suportado!');

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

  movimento.notaFinalChave = notaFinal.chave;
  movimento.notaInicialChave = notaInicial.chave;
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
    const movimentoAnterior = await MovimentoPool.getByNotaFinal(notaInicial.chave);
    movimento.lucro = movimentoAnterior ? (-1) * movimentoAnterior.lucro : 0;
    movimento.valorSaida = 0;
  }

  const impostosFederais = ['pis', 'cofins', 'csll', 'irpj'];

  impostosFederais.forEach((impostoNome) => {
    const valor = movimento.lucro * aliquota[impostoNome];
    imposto[impostoNome] = valor;
    imposto.total += valor;
  });

  const interno = eMovimentoInterno(notaFinal);

  const { estadoDestinoId } = notaFinal;
  const [difalAliquota] = await DifalAliquota.getBy({ estadoId: estadoDestinoId });

  if (interno || !difalAliquota) {
    icms.baseCalculo = movimento.lucro * aliquota.icmsReducao;
    icms.proprio = movimento.lucro * aliquota.icmsReducao * aliquota.icmsAliquota;
    imposto.total += icms.proprio;
    return movimentoPool;
  }


  if (eDestinatarioContribuinte(notaFinal)) {
    icms.baseCalculo = 0.05 * movimento.valorSaida;
    icms.proprio = icms.baseCalculo * difalAliquota.externo;

    imposto.total += icms.proprio;
  } else {
    const estadosSemReducao = [20/* RN */, 5/* BA */, 23/* RS */, 27/* TO */];
    const composicaoBase = movimento.valorSaida;
    const baseCalculo = 0.05 * composicaoBase;
    const baseDifal = estadosSemReducao.includes(estadoDestinoId)
      ? composicaoBase : baseCalculo;
    const proprio = baseDifal * difalAliquota.externo;
    const difal = (baseDifal * difalAliquota.interno) - proprio;

    icms.composicaoBase = composicaoBase;
    icms.baseCalculo = baseCalculo;
    icms.proprio = proprio;
    icms.difalOrigem = 0;
    icms.difalDestino = difal;

    imposto.total += difal + proprio;
  }

  return movimentoPool;
}

module.exports = {
  calcularMovimentoPool,
};
