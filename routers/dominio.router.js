const {
  pegarUsuarioId,
  pegarDominioId,
  adicionarEmpresa,
} = require('../services/postgres');

module.exports = {
  get: {
    root(req, res) {
      const dominioId = req.query.id;

      pegarDominioId(dominioId).then((dominio) => {
        res.send(dominio);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
    id(req, res) {
      const { uid } = req.query;

      pegarUsuarioId(uid).then((user) => {
        const { dominio } = user;
        res.send(dominio);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
  post: {
    empresa(req, res) {
      const { numero, cnpj, dominioId } = req.body;

      adicionarEmpresa(dominioId, numero, cnpj)
        .then(() => {
          res.sendStatus(201);
        }).catch((err) => {
          res.sendStatus(500);
          console.error(err);
        });
    },
  },
};
