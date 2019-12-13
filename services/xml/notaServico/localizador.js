const cidades = require('./cidades');

const isBeloHorizonte = (obj) => (
  obj && obj.CompNfse && obj.CompNfse.Nfse && obj.CompNfse.Nfse.InfNfse
);

const isContagem = (obj) => !!obj['ns2:NFSE'];

function qualCidade(obj) {
  if (isBeloHorizonte(obj)) return cidades.beloHorizonte;
  if (isContagem(obj)) return cidades.contagem;

  return () => [null];
}

module.exports = {
  qualCidade,
};
