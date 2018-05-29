const admin = require('firebase-admin');

const serviceAccount = require('../apiKey');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://danfy-4d504.firebaseio.com',
});

const db = admin.database();

function gravarPessoa(id, pessoa) {
  return db.ref(`Pessoas/${id}`).set(pessoa);
}

function gravarNota(id, nota) {
  return db.ref(`Notas/${id}`).set(nota);
}

function gravarNotaServico(id, nota) {
  return db.ref(`NotasServico/${id}`).set(nota);
}

function pegarEmpresaImpostos(empresaCnpj) {
  return new Promise((resolve, reject) => {
    db.ref(`Impostos/${empresaCnpj}`).once('value', (snap) => {
      const aliquotas = snap.val();
      resolve(aliquotas);
    }, (err) => {
      reject(err);
    });
  });
}

function pegarMovimentoNotaFinal(cnpj, chaveNota) {
  return new Promise((resolve) => {
    const query = db.ref(`Movimentos/${cnpj}`).orderByChild('notaFinal').equalTo(chaveNota);

    let jaFoi = false;

    query.on('child_added', (snap) => {
      const movimento = snap.val();
      if (movimento.metaDados) {
        if (movimento.metaDados.status === 'ATIVO') {
          resolve(movimento);
          jaFoi = true;
        }
      } else {
        resolve(movimento);
        jaFoi = true;
      }
    });
    query.once('value', () => {
      if (!jaFoi) {
        resolve(null);
      }
    });
  });
}

function pegarNotaChave(chave) {
  return new Promise((resolve, reject) => {
    if (chave) {
      db.ref(`Notas/${chave}`).once('value').then((value) => {
        const nota = value.val();
        resolve(nota);
      }, err => reject(err));
    } else {
      resolve(null);
    }
  });
}

function gravarNotaSlim(nota) {
  return new Promise((resolve, reject) => {
    const mockChave = '999999999';
    nota.chave = mockChave; // eslint-disable-line

    db.ref('Notas/').push(nota, (err) => {
      if (err) {
        reject(err);
      } else {
        db.ref('Notas/')
          .orderByChild('chave')
          .equalTo(mockChave)
          .once('child_added', (snap) => {
            const chave = snap.key;
            nota.chave = chave; // eslint-disable-line
            db.ref(`Notas/${chave}`).set(nota, (err2) => {
              if (err2) {
                reject(err2);
              } else {
                resolve(nota);
              }
            });
          });
      }
    });
  });
}


module.exports = {
  gravarPessoa,
  gravarNota,
  gravarNotaServico,
  gravarNotaSlim,
  pegarEmpresaImpostos,
  pegarMovimentoNotaFinal,
  pegarNotaChave,
};
