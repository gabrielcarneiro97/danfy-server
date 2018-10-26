const {
  pegarMovimentosMes,
  pegarNotaChave,
  pegarServicosMes,
} = require('../services/mongoose.service');

const {
  totaisTrimestrais,
} = require('../services/calculador.service');


module.exports = {
  get: {
    root(req, res) {
      const data = {};
      const {
        cnpj,
        mes,
        ano,
        recalcular,
      } = req.query;
      const notas = {};

      const promises = [];

      pegarMovimentosMes(cnpj, { mes, ano }).then((movs) => {
        data.movimentos = movs;
        Object.keys(movs).forEach((k) => {
          promises.push(new Promise((resolve) => {
            const m = movs[k];
            pegarNotaChave(m.notaInicial).then((n1) => {
              pegarNotaChave(m.notaFinal).then((n2) => {
                notas[n1.chave] = n1;
                notas[n2.chave] = n2;
                data.notas = notas;
                resolve();
              }).catch((err) => { console.error(err); });
            }).catch((err) => { console.error(err); });
          }));
        });

        pegarServicosMes(cnpj, { mes, ano }).then((servs) => {
          data.servicos = servs;
          Promise.all(promises).then(() => {
            totaisTrimestrais(cnpj, { mes, ano }, recalcular).then((trim) => {
              data.trimestre = trim;
              console.log(trim);
              res.send(data);
            }).catch((err) => { data.err = err; });
          }).catch(err => console.error(err));
        }).catch((err) => { data.err = err; });
      }).catch((err) => { console.error(err); });
    },
  },
};
