import TotalMovimento from './postgres/models/totalMovimento.model';
import Imposto from './postgres/models/imposto.model';
import Icms from './postgres/models/icms.model';
import Retencao from './postgres/models/retencao.model';
import TotalServico from './postgres/models/totalServico.model';
import Nota from './postgres/models/nota.model';
import NotaServico from './postgres/models/notaServico.model';

import TotalPool from './postgres/pools/total.pool';
import TotalMovimentoPool from './postgres/pools/totalMovimento.pool';
import ImpostoPool from './postgres/pools/imposto.pool';
import TotalServicoPool from './postgres/pools/totalServico.pool';
import MovimentoPool from './postgres/pools/movimento.pool'; // eslint-disable-line no-unused-vars
import ServicoPool from './postgres/pools/servico.pool'; // eslint-disable-line no-unused-vars

import { pegarMes, calcularMes } from './impostos.service';

import { pegarTrimestreTotalPool } from './postgres/total.service';

import {
  trim,
  getMesTrim,
  Comp, // eslint-disable-line no-unused-vars
} from './calculador.service';
import { pegarEmpresaAliquota } from './postgres/aliquota.service';

export type TrimestreData = {
  movimentosPool: MovimentoPool[],
  servicosPool: ServicoPool[],
  trim: TotalPool,
  1?: TotalPool,
  2?: TotalPool,
  3?: TotalPool,
  4?: TotalPool,
  5?: TotalPool,
  6?: TotalPool,
  7?: TotalPool,
  8?: TotalPool,
  9?: TotalPool,
  10?: TotalPool,
  11?: TotalPool,
  12?: TotalPool,
}

export async function calcularTrimestre(cnpj : string, competencia : Comp) {
  const trimestreData : TrimestreData = {
    servicosPool: [],
    movimentosPool: [],
    trim: null,
  };

  const meses = trim(competencia.mes);

  const mesesPromise = meses.map(async (mes) => calcularMes(cnpj, { mes, ano: competencia.ano }));

  const mesesPool = await Promise.all(mesesPromise);

  const totalMovimentoPoolTrimestre = new TotalMovimentoPool(
    new TotalMovimento(null),
    new ImpostoPool(new Imposto(null), new Icms(null)),
  );
  const totalServicoPoolTrimestre = new TotalServicoPool(
    new TotalServico(null),
    new Imposto(null),
    new Retencao(null),
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

  const { irpj: aliquotaIr } = await pegarEmpresaAliquota(cnpj);

  const mesTrim = getMesTrim(competencia.mes);

  const totalPoolTrimestre = await TotalPool.newByPools(
    totalMovimentoPoolTrimestre,
    totalServicoPoolTrimestre,
    cnpj,
    new Date(parseInt(competencia.ano.toString(), 10), mesTrim - 1),
    3,
    aliquotaIr,
  );

  trimestreData.trim = totalPoolTrimestre;

  return trimestreData;
}

export async function pegarTrimestre(cnpj : string, competencia : Comp) {
  const trimestreTotalPool = await pegarTrimestreTotalPool(cnpj, competencia);

  if (!trimestreTotalPool) {
    const trimestreData = await calcularTrimestre(cnpj, competencia);
    await trimestreData.trim.save();
    return trimestreData;
  }
  const trimestreData : TrimestreData = {
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

export async function pegarTrimestreComNotas(cnpj : string, competencia : Comp) {
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

export async function recalcularTrimestre(cnpj : string, competencia : Comp) {
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
