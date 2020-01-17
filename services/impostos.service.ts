import TotalMovimento from './postgres/models/totalMovimento.model';
import Imposto from './postgres/models/imposto.model';
import Icms from './postgres/models/icms.model';
import Retencao from './postgres/models/retencao.model';
import TotalServico from './postgres/models/totalServico.model';
import Nota from './postgres/models/nota.model';
import NotaServico from './postgres/models/notaServico.model';
import Simples from './postgres/models/simples.model';

import TotalPool from './postgres/pools/total.pool';
import TotalMovimentoPool from './postgres/pools/totalMovimento.pool';
import ImpostoPool from './postgres/pools/imposto.pool';
import TotalServicoPool from './postgres/pools/totalServico.pool';
import MovimentoPool from './postgres/pools/movimento.pool';
import ServicoPool from './postgres/pools/servico.pool';

import { pegarMovimentosPoolMes } from './postgres/movimento.service';

import { pegarServicosPoolMes } from './postgres/servico.service';

import { pegarMesTotalPool } from './postgres/total.service';

import { definirGrupo } from './postgres/grupo.service';

import { simples, lp } from './impostos';

import {
  Comp,
} from './calculador.service';
import { pegarEmpresaAliquota } from './postgres/aliquota.service';

export type MesData = {
  totalPool : TotalPool;
  movimentosPool : MovimentoPool[];
  servicosPool : ServicoPool[];
}

export async function pegarMovimentosServicosMes(cnpj : string, competencia : Comp)
  : Promise<{
    movimentosPool: MovimentoPool[];
    servicosPool: ServicoPool[];
    simples: Simples;
  }> {
  const [movimentosPool, servicosPool] = await Promise.all([
    pegarMovimentosPoolMes(cnpj, competencia),
    pegarServicosPoolMes(cnpj, competencia),
  ]);

  return {
    movimentosPool,
    servicosPool,
    simples: null,
  };
}

export async function calcularMes(cnpj : string, competencia : Comp) : Promise<MesData> {
  const { movimentosPool, servicosPool } = await pegarMovimentosServicosMes(cnpj, competencia);

  const totalMovimentoPool = new TotalMovimentoPool(
    new TotalMovimento(null),
    new ImpostoPool(new Imposto(null), new Icms(null)),
  );

  movimentosPool.forEach((movimentoPool) => totalMovimentoPool.soma(movimentoPool));

  const totalServicoPool = new TotalServicoPool(
    new TotalServico(null),
    new Imposto(null),
    new Retencao(null),
  );

  servicosPool.forEach((servicoPool) => totalServicoPool.soma(servicoPool));

  const { irpj: aliquotaIr } = await pegarEmpresaAliquota(cnpj);

  const totalPool = await TotalPool.newByPools(
    totalMovimentoPool,
    totalServicoPool,
    cnpj,
    new Date(parseInt(competencia.ano.toString(), 10),
      parseInt(competencia.mes.toString(), 10) - 1),
    1,
    aliquotaIr,
  );

  return {
    totalPool,
    movimentosPool,
    servicosPool,
  };
}

export async function pegarMes(cnpj : string, competencia : Comp) : Promise<MesData> {
  const totalPool = await pegarMesTotalPool(cnpj, competencia);

  if (!totalPool) {
    const calcMes = await calcularMes(cnpj, competencia);
    await calcMes.totalPool.save();
    return calcMes;
  }
  const { movimentosPool, servicosPool } = await pegarMovimentosServicosMes(cnpj, competencia);

  return {
    totalPool,
    movimentosPool,
    servicosPool,
  };
}

export async function calcularServicoPool(chaveNotaServico : string) {
  const [notaServico] = await NotaServico.getBy('chave', chaveNotaServico);
  const aliquota = await pegarEmpresaAliquota(notaServico.emitenteCpfcnpj);

  const servicoPool = aliquota.tributacao === 'SN'
    ? (await simples.servicos.calcularServicoPool(notaServico))
    : (await lp.servicos.calcularServicoPool(notaServico, aliquota));

  servicoPool.servico.grupoId = await definirGrupo(servicoPool, notaServico);

  return servicoPool;
}

export async function calcularMovimentoPool(notaInicialChave : string, notaFinalChave : string) {
  const [notaFinal] = await Nota.getBy({ chave: notaFinalChave });

  if (notaFinal.estadoGeradorId !== 11) throw new Error('Estado informado não suportado!');

  const aliquota = await pegarEmpresaAliquota(notaFinal.emitenteCpfcnpj);

  const [notaInicial] = notaInicialChave ? await Nota.getBy({ chave: notaInicialChave }) : [null];

  if (aliquota.tributacao === 'SN') {
    return null;
  }

  return lp.movimentos.calcularMovimentoPool(notaInicial, notaFinal, aliquota);
}
