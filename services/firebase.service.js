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

function pegarNotaServicoChave(chave) {
  return new Promise((resolve, reject) => {
    if (chave) {
      db.ref(`NotasServico/${chave}`).once('value').then((value) => {
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


module.exports = {
  gravarPessoa,
  gravarNota,
  gravarNotaServico,
  gravarNotaSlim,
  pegarEmpresaImpostos,
  pegarMovimentoNotaFinal,
  pegarNotaChave,
  pegarNotaServicoChave,
  pegarServicosMes,
  pegarMovimentosMes,
  db,
};
