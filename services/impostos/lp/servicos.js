const {
  Servico,
  MetaDados,
  Imposto,
  Retencao,
} = require('../../postgres/models');

const {
  ServicoPool,
} = require('../../postgres/pools');


async function calcularServicoPool(notaServico, aliquota) {
  const {
    emitenteCpfcnpj,
    status,
    dataHora,
    valor,
  } = notaServico;

  const servico = new Servico();

  servico.donoCpfcnpj = emitenteCpfcnpj;
  servico.notaChave = notaServico.chave;
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

  aliquota.irpj = 0.048; // eslint-disable-line
  aliquota.csll = 0.0288; // eslint-disable-line

  const impostoLista = ['iss', 'pis', 'cofins', 'irpj', 'csll'];
  const { imposto } = servicoPool;
  impostoLista.forEach((impostoNome) => {
    const val = aliquota[impostoNome] * notaServico.valor;
    imposto[impostoNome] = val;
    imposto.total += val;
  });

  imposto.iss = notaServico.iss || imposto.iss;

  const [retencao] = await Retencao.getBy({ id: notaServico.retencaoId });
  servicoPool.retencao = retencao;

  return servicoPool;
}

module.exports = {
  calcularServicoPool,
};
