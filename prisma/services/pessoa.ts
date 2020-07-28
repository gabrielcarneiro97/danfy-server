import prisma from '..';

import PessoaXml from '../../services/xml/pessoa.xml';

function pessoaXmlToObj(pessoa : PessoaXml, action : string) {
  const { cpfcnpj, nome, endereco } = pessoa;

  const pessoaSemEndereco = {
    cpfcnpj,
    nome,
  };

  const {
    logradouro, numero, complemento, bairro, cep,
    municipio, estado: estadoSigla,
  } = endereco;

  const paisId = 1;

  const municipioId = parseInt(municipio.codigo, 10);

  const enderecoPlain = {
    logradouro,
    numero,
    complemento,
    bairro,
    cep,
  };

  return {
    ...pessoaSemEndereco,
    endereco: {
      [action]: {
        ...enderecoPlain,
        municipio: {
          connect: {
            id: municipioId,
          },
        },
        estado: {
          connect: {
            sigla: estadoSigla,
          },
        },
        pais: {
          connect: {
            id: paisId,
          },
        },
      },
    },
  };
}

export function pessoaXmlToCreateObj(pessoa : PessoaXml) {
  return pessoaXmlToObj(pessoa, 'create');
}

export function pessoaXmlToUpdateObj(pessoa : PessoaXml) {
  return pessoaXmlToObj(pessoa, 'update');
}

export async function upsertPessoaXml(pessoa : PessoaXml) {
  const { cpfcnpj, nome, endereco } = pessoa;

  const pessoaSemEndereco = {
    cpfcnpj,
    nome,
  };

  const {
    logradouro, numero, complemento, bairro, cep,
    municipio, estado: estadoSigla,
  } = endereco;

  const paisId = 1;

  const municipioId = parseInt(municipio.codigo, 10);

  const enderecoPlain = {
    logradouro,
    numero,
    complemento,
    bairro,
    cep,
  };

  const res = await prisma.pessoa.upsert({
    update: {
      ...pessoaSemEndereco,
      endereco: {
        update: {
          ...enderecoPlain,
          municipio: {
            connect: {
              id: municipioId,
            },
          },
          estado: {
            connect: {
              sigla: estadoSigla,
            },
          },
          pais: {
            connect: {
              id: paisId,
            },
          },
        },
      },
    },
    create: {
      ...pessoaSemEndereco,
      endereco: {
        create: {
          ...enderecoPlain,
          municipio: {
            connect: {
              id: municipioId,
            },
          },
          estado: {
            connect: {
              sigla: estadoSigla,
            },
          },
          pais: {
            connect: {
              id: paisId,
            },
          },
        },
      },
    },
    where: {
      cpfcnpj,
    },
    include: {
      endereco: {
        include: {
          municipio: true,
          estado: true,
          pais: true,
        },
      },
    },
  });

  return res;
}

export default {
  upsertPessoaXml,
};
