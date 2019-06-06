const { Aliquota } = require('./models');

function criarAliquota(cpfcnpj, aliquotasParam) {
  const aliquotas = new Aliquota({
    ...aliquotasParam,
    donoCpfcnpj: cpfcnpj,
    ativo: true,
  });
  return new Promise((resolve, reject) => {
    Aliquota.getBy({
      donoCpfcnpj: cpfcnpj,
      ativo: true,
    }).then(([aliquotaAntiga]) => {
      const promiseAntiga = new Promise((resolveAntiga, rejectAntiga) => {
        if (aliquotaAntiga) {
          aliquotaAntiga.ativo = false;
          aliquotaAntiga.validade = new Date();

          aliquotaAntiga.save().then(resolveAntiga).catch(rejectAntiga);
        } else resolveAntiga();
      });

      promiseAntiga.then(() => {
        aliquotas.save().then(resolve).catch(reject);
      });
    });
  });
}

function pegarEmpresaAliquota(cpfcnpj) {
  return new Promise((resolve, reject) => {
    Aliquota.getBy({
      donoCpfcnpj: cpfcnpj,
      ativo: true,
    }).then(([aliquota]) => resolve(aliquota))
      .catch(reject);
  });
}

module.exports = {
  criarAliquota,
  pegarEmpresaAliquota,
};
