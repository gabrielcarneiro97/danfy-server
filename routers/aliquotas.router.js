const {
  pegarEmpresaAliquotas,
  criarAliquota,
} = require('../services/mongoose.service');

module.exports = {
  post: {
    root(req, res) {
      const { cnpj, aliquotas } = req.body;

      criarAliquota(cnpj, aliquotas).then(() => {
        res.sendStatus(201);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
  get: {
    root(req, res) {
      const { cnpj } = req.query;

      pegarEmpresaAliquotas(cnpj).then((aliquotas) => {
        res.send(aliquotas);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
};
