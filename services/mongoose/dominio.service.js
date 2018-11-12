const { Dominio } = require('../../models');

function criarDominio(_id, dominioParam) {
  const dominio = new Dominio({ _id, ...dominioParam });

  return dominio.save();
}

function pegarDominioId(_id) {
  return Dominio.findById(_id);
}

function adicionarEmpresa(_id, num, cnpj) {
  const numStr = `empresas.${num}`;
  return Dominio.updateOne({ _id }, {
    $set: { [numStr]: cnpj },
  });
}

module.exports = {
  criarDominio,
  pegarDominioId,
  adicionarEmpresa,
};
