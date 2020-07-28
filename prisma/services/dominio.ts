import { PrismaClient } from '@prisma/client';

export async function pegarDominioCodigo(codigo : string) {
  const prisma = new PrismaClient();

  const dominio = await prisma.dominio.findMany({
    where: {
      codigo,
    },
  });

  prisma.disconnect();

  return dominio;
}

export async function adicionarEmpresa(codigo : string, numero: string, cnpj : string) {
  const prisma = new PrismaClient();

  const dominio = await prisma.dominio.create({
    data: {
      codigo,
      numero,
      cnpj,
    },
  });

  prisma.disconnect();

  return dominio;
}
