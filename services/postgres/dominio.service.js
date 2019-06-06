const { Dominio } = require('./models');

function pegarDominioId(codigo) {
  return Dominio.getBy({ codigo });
}

function adicionarEmpresa(codigo, numero, cnpj) {
  return new Dominio({
    codigo,
    numero,
    cnpj,
  }).save();
}

module.exports = {
  pegarDominioId,
  adicionarEmpresa,
};
