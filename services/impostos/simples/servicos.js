const {
  Servico,
  MetaDados,
  Imposto,
  Retencao,
} = require('../../postgres/models');

const {
  ServicoPool,
} = require('../../postgres/pools');


async function calcularServicoPool(notaServico) {
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

  const { imposto } = servicoPool;

  imposto.iss = notaServico.iss;

  const [retencao] = await Retencao.getBy({ id: notaServico.retencaoId });
  servicoPool.retencao = retencao;

  return servicoPool;
}

module.exports = {
  calcularServicoPool,
};
