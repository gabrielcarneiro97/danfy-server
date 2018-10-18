const admin = require('firebase-admin');

const serviceAccount = require('./apiKey');
const serviceAccount2 = require('./danfy-rebuild-apiKey');

const appDb = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://danfy-4d504.firebaseio.com',
}, 'Old');


const appFs = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount2),
  databaseURL: 'https://danfy-rebuild.firebaseio.com',
}, 'New');

const db = appDb.database();

const firestore = appFs.firestore();


db.ref('/Notas').once('value', (snap) => {
  const notas = snap.val();
  const notasNovas = [];

  Object.keys(notas).forEach((chave) => {
    let nota = notas[chave];

    const produtosCodigo = {};
    if (nota.produtos) {
      Object.keys(nota.produtos).forEach((key) => { produtosCodigo[key] = true; });
      nota = { ...nota, produtosCodigo };
      notasNovas.push(nota);
    }
  });

  notasNovas.forEach((nota) => {

  });

  console.log(notasNovas);
});

// db.ref('/Notas').once('value', (snap) => {
//   Object.keys(snap.val()).forEach((chave) => {
//     const nota = snap.val()[chave];
//     const produtosCodigo = {};
//     if (nota.produtos) {
//       console.log(chave);
//       Object.keys(nota.produtos).forEach((key) => { produtosCodigo[key] = true; });
//       console.log({ produtosCodigo });
//       db.ref(`Notas/${chave}`).update({ produtosCodigo }).catch(err => console.log(err));
//     }
//   });
// });
