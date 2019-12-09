const aliquotaService = require('./aliquota.service');
const dominioService = require('./dominio.service');
const movimentoService = require('./movimento.service');
const notaService = require('./nota.service');
const notaServicoService = require('./notaServico.service');
const pessoaService = require('./pessoa.service');
const servicoService = require('./servico.service');

module.exports = {
  ...aliquotaService,
  ...dominioService,
  ...movimentoService,
  ...notaService,
  ...notaServicoService,
  ...pessoaService,
  ...servicoService,
};
