const {
  TotalPool,
} = require('./pools');

async function gravarTotalPool(totalPool) {
  return totalPool.save();
}

async function pegarMesTotalPool(cnpj, competencia) {
  return TotalPool.getByCnpjComp(cnpj, competencia, 1);
}

async function pegarTrimestreTotalPool(cnpj, competencia) {
  return TotalPool.getByCnpjComp(cnpj, competencia, 3);
}

module.exports = {
  gravarTotalPool,
  pegarMesTotalPool,
  pegarTrimestreTotalPool,
};
