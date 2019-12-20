import Movimento from '../../postgres/models/movimento.model';
import MetaDados from '../../postgres/models/metaDados.model';
import Imposto from '../../postgres/models/imposto.model';
import Icms from '../../postgres/models/icms.model';
import DifalAliquota from '../../postgres/models/difalAliquota.model';
import Nota from '../../postgres/models/nota.model'; // eslint-disable-line no-unused-vars
import Aliquota from '../../postgres/models/aliquota.model'; // eslint-disable-line no-unused-vars

import MovimentoPool from '../../postgres/pools/movimento.pool';
import ImpostoPool from '../../postgres/pools/imposto.pool';

import {
  cfopDevolucao,
  cfopDevolucaoConsignacao,
  cfopDevolucaoDemonstracao,
} from '../../calculador.service';

function eMovimentoInterno(nota : Nota) {
  return nota.estadoGeradorId === nota.estadoDestinoId;
}

function eDestinatarioContribuinte(nota : Nota) {
  return nota.destinatarioContribuinte === '1';
}

function eDevolucao(nota : Nota) {
  return cfopDevolucao.includes(nota.cfop);
}

function eDevolucaoConsigOuDemo(nota : Nota) {
  return cfopDevolucaoConsignacao.includes(nota.cfop)
  || cfopDevolucaoDemonstracao.includes(nota.cfop);
}

async function calcularMovimentoPool(notaInicial : Nota, notaFinal : Nota, aliquota : Aliquota) {
  if (notaFinal.estadoGeradorId !== 11) throw new Error('Estado informado não suportado!');

  const movimento = new Movimento(null);
  const metaDados = new MetaDados(null);
  const imposto = new Imposto(null);
  const icms = new Icms(null);

  const movimentoPool = new MovimentoPool(
    movimento,
    metaDados,
    new ImpostoPool(imposto, icms),
  );
  metaDados.mdDataHora = new Date();
  metaDados.ativo = true;
  metaDados.tipo = 'PRIM';

  movimento.notaFinalChave = notaFinal.chave;
  movimento.notaInicialChave = notaInicial && notaInicial.chave;
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
    movimento.lucro = movimentoAnterior ? (-1) * movimentoAnterior.movimento.lucro : 0;
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

export default {
  calcularMovimentoPool,
};
