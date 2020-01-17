import ServicoPool from './pools/servico.pool';

import Grupo from './models/grupo.model';
import NotaServico from './models/notaServico.model';


export async function definirGrupo(servicoPool : ServicoPool, notaServico : NotaServico) {
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
