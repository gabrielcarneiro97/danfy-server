const { Dominio } = require('./models');

async function pegarDominioCodigo(codigo) {
  const dominio = (await Dominio.getBy({ codigo })).map(o => ({
    numero: o.numero,
    id: o.id,
    cnpj: o.cnpj,
  }));

  return dominio;
}

async function adicionarEmpresa(codigo, numero, cnpj) {
  return new Dominio({
    codigo,
    numero,
    cnpj,
  }).save();
}

module.exports = {
  pegarDominioCodigo,
  adicionarEmpresa,
};
