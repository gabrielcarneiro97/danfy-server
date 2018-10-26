const {
  pegarNotaServicoChave,
} = require('../services/mongoose.service');

const {
  calcularImpostosServico,
} = require('../services/calculador.service');

module.exports = {
  get: {
    root(req, res) {
      const { notaServico } = req.query;
      let { dominioId, email } = req.query;
      dominioId = decodeURI(dominioId);
      email = decodeURI(email);
      pegarNotaServicoChave(notaServico).then((notaServicoObj) => {
        calcularImpostosServico(notaServicoObj).then((valores) => {
          const servico = {
            nota: notaServico,
            dominio: dominioId,
            conferido: true,
            valores,
            metaDados: {
              criadoPor: email,
              dataCriacao: new Date().toISOString(),
            },
            data: notaServicoObj.geral.dataHora,
            notaStatus: notaServicoObj.geral.status,
          };
          res.send(servico);
        }).catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
    id(req, res) {
      const { servicoId, cnpj } = req.query;

    },
  },
};
