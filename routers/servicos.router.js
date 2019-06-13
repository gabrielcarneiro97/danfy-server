const {
  pegarNotaServicoChave,
  pegarServico,
  pegarServicoNota,
  pushServico,
  pegarMovimentosServicosTotal,
  excluirServico,
} = require('../services/postgres');

const {
  calcularImpostosServico,
} = require('../services/impostos.service');

module.exports = {
  get: {
    calcular(req, res) {
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
      pegarServico(cnpj, servicoId).then((servico) => {
        res.send(servico);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
    nota(req, res) {
      const { notaChave, cnpj } = req.query;
      pegarServicoNota(cnpj, notaChave).then((servico) => {
        res.send(servico);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
  post: {
    push(req, res) {
      const { servico, cnpj } = req.body;
      pegarServicoNota(cnpj, servico.nota).then(({ servicoExiste }) => {
        if (servicoExiste) {
          res.status(409).send(new Error(`Nota já registrada em outro serviço! ID: ${servicoExiste._id}`));
        } else {
          pushServico(cnpj, servico).then(() => {
            res.sendStatus(200);
          });
        }
      });
    },
  },
  delete: {
    id(req, res) {
      const { servicoId, cnpj } = req.query;
      excluirServico(cnpj, servicoId).then((infos) => {
        const date = new Date(infos.servicoCompetencia);
        const mes = date.getMonth() + 1;
        const ano = date.getFullYear();
        pegarMovimentosServicosTotal(cnpj, { mes, ano }, true).then((data) => {
          res.send(data);
        }).catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
};
