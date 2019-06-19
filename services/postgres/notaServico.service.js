const { NotaServico, Retencao } = require('./models');
const { NotaServicoPool } = require('./pools');

const { objParseFloat } = require('../calculador.service');

async function criarNotaServico(notaServicoParam) {
  return new NotaServico({
    chave: notaServicoParam.emitente + notaServicoParam.numero,
    ...notaServicoParam,
  }).save();
}

async function pegarNotaServicoChave(chave) {
  return NotaServico.getBy({ chave });
}

async function notaServicoXmlToPool(notaObj) {
  const retObj = { ...notaObj.valor.retencoes };

  objParseFloat(retObj);

  const retencao = new Retencao(retObj);
  retencao.totalize();

  const notaFlat = {
    chave: notaObj.chave,
    valor: parseFloat(notaObj.valor.servico),
    iss: parseFloat(notaObj.valor.iss.valor),
    emitenteCpfcnpj: notaObj.emitente,
    destinatarioCpfcnpj: notaObj.destinatario,
    ...notaObj.geral,
    dataHora: new Date(notaObj.geral.dataHora),
  };

  const notaServico = new NotaServico(notaFlat);

  const notaServicoPool = new NotaServicoPool(notaServico, retencao);
  await notaServicoPool.save();

  return notaServicoPool;
}

module.exports = {
  criarNotaServico,
  pegarNotaServicoChave,
  notaServicoXmlToPool,
};
