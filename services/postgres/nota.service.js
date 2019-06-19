const crypto = require('crypto');
const { pg } = require('../');
const { Nota, Estado, Produto } = require('./models');
const { NotaPool } = require('./pools');

async function criarNota(chave, notaParam) {
  const nota = new Nota({ ...chave, notaParam });
  await nota.save();
  return nota;
}

async function criarNotaPoolSlim(valor, destinatario) {
  const nota = new Nota();
  nota.emitenteCpfcnpj = 'INTERNO';
  nota.dataHora = new Date();
  nota.cfop = 'INTERNO';
  nota.status = 'INTERNO';
  nota.tipo = 'INTERNO';
  nota.destinatarioCpfcnpj = destinatario;
  nota.valor = valor;

  let chave;
  let notasPg;

  /* eslint-disable no-await-in-loop */
  do {
    chave = crypto.randomBytes(20).toString('hex');
    notasPg = await Nota.getBy({ chave });
  } while (notasPg.length !== 0);

  nota.chave = chave;

  const notaPool = new NotaPool(nota);

  await notaPool.save();

  return notaPool;
}

async function pegarNotasPoolProdutoEmitente(nome, cnpj) {
  if (nome === 'INTERNO') {
    throw new Error('Id inválido (INTERNO)');
  } else {
    try {
      const notasPg = await pg.select('nota.chave')
        .from('tb_produto as prod')
        .innerJoin('tb_nota as nota', 'prod.nota_chave', 'nota.chave')
        .where('prod.nome', nome)
        .andWhere('nota.emitente_cpfcnpj', cnpj);

      const notas = await Promise.all(notasPg.map(async o => NotaPool.getByChave(o.chave)));

      return notas;
    } catch (err) {
      throw err;
    }
  }
}

async function pegarNotaChave(chave) {
  try {
    const notaPg = await Nota.getBy({ chave });
    return new Nota(notaPg, true);
  } catch (err) {
    throw err;
  }
}

async function notaXmlToPool(notaObj) {
  const notaFlat = {
    ...notaObj,
    ...notaObj.geral,
  };

  delete notaFlat.geral;

  notaFlat.emitenteCpfcnpj = notaFlat.emitente;
  notaFlat.destinatarioCpfcnpj = notaFlat.destinatario;

  delete notaFlat.emitente;
  delete notaFlat.destinatario;

  const { informacoesEstaduais } = notaFlat;
  notaFlat.estadoGeradorId = await Estado.getIdBySigla(informacoesEstaduais.estadoGerador);
  notaFlat.estadoDestinoId = await Estado.getIdBySigla(informacoesEstaduais.estadoDestino);
  notaFlat.destinatarioContribuinte = informacoesEstaduais.destinatarioContribuinte;
  delete notaFlat.informacoesEstaduais;

  notaFlat.valor = parseFloat(notaFlat.valor.total);

  const { complementar } = notaFlat;
  notaFlat.textoComplementar = complementar.textoComplementar;
  delete notaFlat.complementar;

  const produtosObj = {
    ...notaFlat.produtos,
  };

  delete notaFlat.produtos;
  delete notaFlat.produtosCodigo;

  const nota = new Nota(notaFlat);

  const produtos = [];

  Object.keys(produtosObj).forEach((nome) => {
    const prodObj = produtosObj[nome];
    const prodFlat = {
      nome,
      descricao: prodObj.descricao,
      quantidade: parseInt(prodObj.quantidade.numero, 10),
      valor: parseFloat(prodObj.valor.total),
      notaChave: nota.chave,
    };

    produtos.push(new Produto(prodFlat));
  });

  const notaPool = new NotaPool(nota, produtos);

  await notaPool.save();

  return notaPool;
}

module.exports = {
  criarNota,
  pegarNotasPoolProdutoEmitente,
  pegarNotaChave,
  criarNotaPoolSlim,
  notaXmlToPool,
};
