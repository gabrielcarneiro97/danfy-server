const { Aliquota } = require('./models');

async function criarAliquota(aliquotasParam) {
  const aliquota = new Aliquota({
    ...aliquotasParam,
    ativo: true,
  });

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
}

async function pegarEmpresaAliquota(cpfcnpj) {
  const [aliquota] = await Aliquota.getBy({
    donoCpfcnpj: cpfcnpj,
    ativo: true,
  });

  return aliquota;
}

module.exports = {
  criarAliquota,
  pegarEmpresaAliquota,
};
