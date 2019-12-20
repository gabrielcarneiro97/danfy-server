import ServicoPool from './pools/servico.pool'; // eslint-disable-line no-unused-vars

import Grupo from './models/grupo.model';
import NotaServico from './models/notaServico.model'; // eslint-disable-line no-unused-vars


async function definirGrupo(servicoPool : ServicoPool, notaServico : NotaServico) {
  const { servico } = servicoPool;

  const grupos = await Grupo.getBy({ donoCpfcnpj: servico.donoCpfcnpj });

  if (grupos.length === 0) return null;


  const grupo = grupos.find((g) => {
    const regex = new RegExp(g.descricao, 'i');
    return regex.test(notaServico.descricao);
  });

  if (!grupo) return null;

  return grupo.id;
}

export default { definirGrupo };
