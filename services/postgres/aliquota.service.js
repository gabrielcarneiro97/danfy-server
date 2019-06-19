const { Aliquota } = require('./models');

async function criarAliquota(aliquotasParam) {
  const aliquota = new Aliquota({
    ...aliquotasParam,
    ativo: true,
  });

  try {
    const [aliquotaAntiga] = await Aliquota.getBy({
      donoCpfcnpj: aliquota.donoCpfcnpj,
      ativo: true,
    });

    if (aliquotaAntiga) {
      aliquotaAntiga.ativo = false;
      aliquotaAntiga.validade = new Date();

      await aliquotaAntiga.save();
    }
    return aliquota.save();
  } catch (err) {
    throw err;
  }
}

async function pegarEmpresaAliquota(cpfcnpj) {
  try {
    const [aliquota] = await Aliquota.getBy({
      donoCpfcnpj: cpfcnpj,
      ativo: true,
    });

    return aliquota;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  criarAliquota,
  pegarEmpresaAliquota,
};
