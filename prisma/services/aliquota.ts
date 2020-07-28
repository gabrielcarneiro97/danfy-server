import { PrismaClient, AliquotaCreateInput } from '@prisma/client';

export async function pegarEmpresaAliquota(donoCpfcnpj : string) {
  const prisma = new PrismaClient();

  const [aliquota] = await prisma.aliquota.findMany({
    where: {
      donoCpfcnpj,
      ativo: true,
    },
  });

  prisma.disconnect();

  return aliquota;
}

export async function criarAliquota(aliquotasParam : AliquotaCreateInput) {
  const prisma = new PrismaClient();

  const aliquota = await prisma.aliquota.create({
    data: {
      ...aliquotasParam,
      ativo: true,
    },
  });

  const aliquotaAntiga = await pegarEmpresaAliquota(aliquota.donoCpfcnpj);

  if (aliquotaAntiga) {
    await prisma.aliquota.update({
      where: {
        id: aliquotaAntiga.id,
      },
      data: {
        ativo: false,
        validade: new Date(),
      },
    });
  }

  prisma.disconnect();

  return aliquota;
}
