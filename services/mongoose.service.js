const nota = require('./mongoose/nota.service');
const notaServico = require('./mongoose/notaServico.service');
const pessoa = require('./mongoose/pessoa.service');
const aliquota = require('./mongoose/aliquota.service');
const movimento = require('./mongoose/movimento.service');
const servico = require('./mongoose/servico.service');
const total = require('./mongoose/total.service');
const usuario = require('./mongoose/usuario.service');
const dominio = require('./mongoose/dominio.service');

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
