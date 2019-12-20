import Aliquota from './models/aliquota.model';

export async function criarAliquota(aliquotasParam : object) {
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

export async function pegarEmpresaAliquota(cpfcnpj : string) {
  const [aliquota] = await Aliquota.getBy({
    donoCpfcnpj: cpfcnpj,
    ativo: true,
  });

  return aliquota;
}
