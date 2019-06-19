const {
  TotalPool,
} = require('./pools');

const { getMesTrim } = require('../calculador.service');

async function gravarTotalPool(totalPool) {
  return totalPool.save();
}

async function pegarMesTotalPool(cnpj, competencia) {
  return TotalPool.getByCnpjComp(cnpj, competencia, 1);
}

async function pegarTrimestreTotalPool(cnpj, competencia) {
  const mes = getMesTrim(competencia.mes);
  return TotalPool.getByCnpjComp(cnpj, { ...competencia, mes }, 3);
}

module.exports = {
  gravarTotalPool,
  pegarMesTotalPool,
  pegarTrimestreTotalPool,
};
