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

module.exports = {
  gravarPessoa,
  gravarNota,
  gravarNotaServico,
};
