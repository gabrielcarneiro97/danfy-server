const { Grupo } = require('./postgres/models');

async function definirGrupo(servicoPool, notaServico) {
  const { servico } = servicoPool;

  console.log(servico, notaServico);

  const grupos = await Grupo.getBy({ donoCpfcnpj: servico.donoCpfcnpj });
  console.log(grupos);

  if (grupos.length === 0) return null;


  const grupo = grupos.find((g) => {
    const regex = new RegExp(g.descricao, 'i');
    return regex.test(notaServico.descricao);
  });

  if (!grupo) return null;

  return grupo.id;
}

module.exports = { definirGrupo };
