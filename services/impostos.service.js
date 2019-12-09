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

const { pegarMovimentosPoolMes } = require('./postgres/movimento.service');

const { pegarServicosPoolMes } = require('./postgres/servico.service');

const { pegarMesTotalPool } = require('./postgres/total.service');

const impostos = require('./impostos');

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

  movimentosPool.forEach((movimentoPool) => totalMovimentoPool.soma(movimentoPool));

  const totalServicoPool = new TotalServicoPool(new TotalServico(), new Imposto(), new Retencao());

  servicosPool.forEach((servicoPool) => totalServicoPool.soma(servicoPool));

  const [{ irpj: aliquotaIr }] = await Aliquota.getBy('dono_cpfcnpj', cnpj);

  const totalPool = await TotalPool.newByPools(
    totalMovimentoPool,
    totalServicoPool,
    cnpj,
    new Date(competencia.ano, competencia.mes - 1),
    1,
    aliquotaIr,
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

async function calcularServicoPool(chaveNotaServico) {
  const [notaServico] = await NotaServico.getBy('chave', chaveNotaServico);
  const [aliquota] = await Aliquota.getBy({
    donoCpfcnpj: notaServico.emitenteCpfcnpj,
    ativo: true,
  });

  if (aliquota.tributacao === 'SN') {
    return impostos.simples.servicos.calcularServicoPool(notaServico);
  }

  return impostos.lp.servicos.calcularServicoPool(notaServico, aliquota);
}

async function calcularMovimentoPool(notaInicialChave, notaFinalChave) {
  const [notaFinal] = await Nota.getBy({ chave: notaFinalChave });

  if (notaFinal.estadoGeradorId !== 11) throw new Error('Estado informado não suportado!');

  const [aliquota] = await Aliquota.getBy({ donoCpfcnpj: notaFinal.emitenteCpfcnpj, ativo: true });

  const [notaInicial] = notaInicialChave ? await Nota.getBy({ chave: notaInicialChave }) : [null];

  if (aliquota.tributacao === 'SN') {
    return null;
  }

  return impostos.lp.calcularMovimentoPool(notaInicial, notaFinal, aliquota);
}

module.exports = {
  calcularMes,
  pegarMes,
  calcularServicoPool,
  calcularMovimentoPool,
};
