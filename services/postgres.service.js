const nota = require('./postgres/nota.service');
const notaServico = require('./postgres/notaServico.service');
const pessoa = require('./postgres/pessoa.service');
const aliquota = require('./postgres/aliquota.service');
const movimento = require('./postgres/movimento.service');
const servico = require('./postgres/servico.service');
const total = require('./postgres/total.service');
const usuario = require('./postgres/usuario.service');
const dominio = require('./postgres/dominio.service');

module.exports = {
  ...nota,
  ...notaServico,
  ...pessoa,
  ...aliquota,
  ...movimento,
  ...servico,
  ...total,
  ...usuario,
  ...dominio,
};
