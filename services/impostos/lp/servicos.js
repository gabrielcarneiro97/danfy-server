const {
  NotaServico,
  Servico,
  MetaDados,
  Imposto,
  Retencao,
  Aliquota,
} = require('../../postgres/models');

const {
  ServicoPool,
} = require('../../postgres/pools');


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
  servico.valor = 0;
  servico.conferido = true;

  if (status === 'CANCELADA') {
    return new ServicoPool(servico, new MetaDados(), new Imposto(), new Retencao());
  }

  servico.valor = valor;

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
  const { imposto } = servicoPool;
  impostoLista.forEach((impostoNome) => {
    const val = aliquota[impostoNome] * nota.valor;
    imposto[impostoNome] = val;
    imposto.total += val;
  });

  imposto.iss = nota.iss || imposto.iss;

  const [retencao] = await Retencao.getBy({ id: nota.retencaoId });
  servicoPool.retencao = retencao;

  return servicoPool;
}

module.exports = {
  calcularServicoPool,
};
