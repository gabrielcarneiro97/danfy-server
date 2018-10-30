const {
  pegarMovimentosServicosTotal,
} = require('../services/mongoose.service');

module.exports = {
  get: {
    root(req, res) {
      const {
        cnpj,
        mes,
        ano,
        recalcular,
      } = req.query;

      pegarMovimentosServicosTotal(cnpj, mes, ano, recalcular).then((data) => {
        res.send(data);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
};
