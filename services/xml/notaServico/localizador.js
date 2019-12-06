const cidades = require('./cidades');

const isBeloHorizonte = (obj) => (
  obj && obj.CompNfse && obj.CompNfse.Nfse && obj.CompNfse.Nfse.InfNfse
);

function qualCidade(obj) {
  if (isBeloHorizonte(obj)) return cidades.beloHorizonte;

  return () => ({
    emitente: null,
    destinatario: null,
    notaServico: null,
    desconhecida: true,
  });
}

module.exports = {
  qualCidade,
};
