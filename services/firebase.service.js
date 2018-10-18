const admin = require('firebase-admin');

const serviceAccount = require('../danfy-rebuild-apiKey');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://danfy-rebuild.firebaseio.com',
});

const db = admin.database();
const firestore = admin.firestore();

const PESSOAS = firestore.collection('Pessoas');
const NOTAS = firestore.collection('Notas');
const NOTAS_SERVICO = firestore.collection('NotasServico');

function criarPessoa(id, pessoa) {
  return new Promise((resolve, reject) => {
    const doc = PESSOAS.doc(id);

    doc
      .get()
      .then((snap) => {
        if (!snap.data()) {
          doc
            .set(pessoa)
            .then(newSnap => resolve(newSnap))
            .catch(err => reject(err));
        } else {
          doc
            .update(pessoa)
            .then(newSnap => resolve(newSnap))
            .catch(err => reject(err));
        }
      })
      .catch(err => reject(err));
  });
}

const atualizarPessoa = criarPessoa;

function criarNota(id, nota) {
  return NOTAS.doc(id).set(nota);
}

function criarNotaServico(id, nota) {
  return NOTAS_SERVICO.doc(id).set(nota);
}

function pegarEmpresaImpostos(cnpj) {
  return new Promise((resolve, reject) => {
    PESSOAS
      .doc(cnpj)
      .get()
      .then(snap => resolve(snap.data().Aliquotas))
      .catch(err => reject(err));
  });
}

function pegarMovimentoNotaFinal(cnpj, chaveNota) {
  return new Promise((resolve, reject) => {
    PESSOAS
      .doc(cnpj)
      .collection('Movimentos')
      .where('notaFinal', '==', chaveNota)
      .where('metaDados.status', '==', 'ATIVO')
      .get()
      .then(({ docs }) => {
        if (docs.length !== 0) {
          resolve(docs[0].data());
        } else {
          reject(new Error('Mais de um documento ativo com a chave informada!'));
        }
      })
      .catch(err => reject(err));
  });
}

function pegarNotaChave(chave) {
  return new Promise((resolve, reject) => {
    NOTAS
      .doc(chave)
      .get()
      .then(snap => resolve(snap.data()))
      .catch(err => reject(err));
  });
}

function pegarNotaServicoChave(chave) {
  return new Promise((resolve, reject) => {
    NOTAS_SERVICO
      .doc(chave)
      .get()
      .then(snap => resolve(snap.data()))
      .catch(err => reject(err));
  });
}

function criarNotaSlim(nota) {
  return new Promise((resolve, reject) => {
    NOTAS
      .add(nota)
      .then((doc) => {
        doc
          .update({ chave: doc.id })
          .then(() => resolve())
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
}

function pegarNotasProduto(id) {
  return new Promise((resolve, reject) => {
    if (id !== 'INTERNO') {
      NOTAS
        .where(`produtosCodigo.${id}`, '==', true)
        .get()
        .then(({ docs }) => {
          const notas = [];
          docs.forEach((snapDoc) => {
            notas.push(snapDoc.data());
          });
          resolve(notas);
        })
        .catch(err => reject(err));
    } else {
      resolve([]);
    }
  });
}

function pegarServicosMes(cnpj, competencia) {
  return new Promise((resolve, reject) => {
    const servicos = {};
    const query = db.ref(`Servicos/${cnpj}`);
    query.orderByChild('data').on('child_added', (snap) => {
      const servico = snap.val();
      const servicoId = snap.key;
      const data = new Date(servico.data);
      const mes = (data.getUTCMonth() + 1).toString();
      const ano = data.getUTCFullYear().toString();

      if (mes === competencia.mes && ano === competencia.ano) {
        servicos[servicoId] = servico;
      }
    });
    query.once('value', () => resolve(servicos), err => reject(err));
  });
}

function pegarMovimentosMes(cnpj, competencia) {
  return new Promise((resolve, reject) => {
    PESSOAS
      .doc(cnpj)
      .collection('Movimentos')
      .get()
      .then((docs) => {

      });

    const movimentos = {};
    const query = db.ref(`Movimentos/${cnpj}`);
    query.orderByChild('data').on('child_added', (snap) => {
      const movimento = snap.val();
      const movimentoId = snap.key;
      const data = new Date(movimento.data);
      const mes = (data.getUTCMonth() + 1).toString();
      const ano = data.getUTCFullYear().toString();

      if (movimento.metaDados) {
        if (movimento.metaDados.status !== 'CANCELADO' &&
          mes === competencia.mes &&
          ano === competencia.ano) {
          movimentos[movimentoId] = movimento;
        }
      } else if (mes === competencia.mes && ano === competencia.ano) {
        movimentos[movimentoId] = movimento;
      }
    });
    query.once('value', () => resolve(movimentos), err => reject(err));
  });
}

function pegarTotais(cnpj, { mes, ano }) {
  return new Promise((resolve, reject) => {
    db
      .ref(`Totais/${cnpj}/${ano}/${mes}`)
      .once('value')
      .then(snap => resolve(snap.val()))
      .catch(err => reject(err));
  });
}

function gravarTotais(dados, cnpj, { mes, ano }) {
  return new Promise((resolve, reject) => {
    db
      .ref(`Totais/${cnpj}/${ano}/${mes}`)
      .set(dados)
      .then(() => resolve())
      .catch(err => reject(err));
  });
}


module.exports = {
  criarPessoa,
  atualizarPessoa,
  criarNota,
  criarNotaServico,
  criarNotaSlim,
  pegarEmpresaImpostos,
  pegarMovimentoNotaFinal,
  pegarNotaChave,
  pegarNotasProduto,
  pegarNotaServicoChave,
  pegarServicosMes,
  pegarMovimentosMes,
  pegarTotais,
  gravarTotais,
  db,
};
