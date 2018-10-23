const { Dominio } = require('../../models');

function criarDominio(_id, dominioParam) {
  const dominio = new Dominio({ _id, ...dominioParam });

  return dominio.save();
}

module.exports = {
  criarDominio,
};
