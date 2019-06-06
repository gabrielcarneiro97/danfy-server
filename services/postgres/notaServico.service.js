const { NotaServico } = require('./models');

function criarNotaServico(notaServicoParam) {
  return new NotaServico({
    chave: notaServicoParam.emitente + notaServicoParam.numero,
    ...notaServicoParam,
  }).save();
}

function pegarNotaServicoChave(chave) {
  return NotaServico.getBy({ chave });
}

module.exports = {
  criarNotaServico,
  pegarNotaServicoChave,
};
