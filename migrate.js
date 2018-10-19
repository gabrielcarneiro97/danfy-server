const admin = require('firebase-admin');
const serviceAccount = require('./apiKey');

const {
  criarNota,
  criarNotaServico,
  criarPessoa,
  criarMovimento,
  criarMovimentos,
  criarServicos,
  criarAliquota,
  criarTotais,
} = require('./services');

const appDb = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://danfy-4d504.firebaseio.com',
}, 'Old');

const db = appDb.database();


// db.ref('/Notas').once('value', (snap) => {
//   const notas = snap.val();
//   console.log(notas);

//   Object.keys(notas).forEach((chave) => {
//     const nota = notas[chave];


//     criarNota(chave, nota).then(() => console.log(chave)).catch(err => console.error(err));
//   });
// });

// db.ref('/NotasServico').once('value', (snap) => {
//   const notas = snap.val();

//   Object.keys(notas).forEach((chave) => {
//     const nota = notas[chave];

//     criarNotaServico(nota).then(() => console.log(chave)).catch(err => console.error(err));
//   });
// });

// db.ref('/Pessoas').once('value', (snap) => {
//   const pessoas = snap.val();

//   console.log(Object.keys(pessoas).length);

//   Object.keys(pessoas).forEach((id) => {
//     const pessoa = pessoas[id];

//     criarPessoa(id, pessoa).then(() => console.log(id)).catch(err => console.error(err));
//   });
// });

// db.ref('/Movimentos').once('value', (snap) => {
//   const empresas = snap.val();
//   Object.keys(empresas).forEach((cnpj) => {
//     const movimentos = empresas[cnpj];
//     criarMovimentos(cnpj, Object.values(movimentos))
//       .then(() => console.log(cnpj))
//       .catch(err => console.error(err));
//   });
// });

// db.ref('/Servicos').once('value', (snap) => {
//   const empresas = snap.val();
//   Object.keys(empresas).forEach((cnpj) => {
//     const servicos = empresas[cnpj];
//     criarServicos(cnpj, Object.values(servicos))
//       .then(() => console.log(cnpj))
//       .catch(err => console.error(err));
//   });
// });

// db.ref('/Impostos').once('value', (snap) => {
//   const empresas = snap.val();

//   Object.keys(empresas).forEach((cnpj) => {
//     const aliquotas = empresas[cnpj];
//     criarAliquota(cnpj, aliquotas)
//       .then(() => console.log(cnpj))
//       .catch(err => console.error(err));
//   });
// });

db.ref('/Totais').once('value', (snap) => {
  const empresas = snap.val();

  Object.keys(empresas).forEach((cnpj) => {
    const anos = empresas[cnpj];
    const totais = [];

    Object.keys(anos).forEach((ano) => {
      const meses = anos[ano];
      Object.keys(meses).forEach((mes) => {
        const total = meses[mes];
        total.competencia = new Date(ano, mes, '1');
        totais.push(total);
      });
    });

    criarTotais(cnpj, totais).then(() => console.log(cnpj)).catch(err => console.error(err));
  });
});

