const { Pessoa } = require('../../models');

function criarAliquota(idPessoa, aliquotasParam) {
  const aliquotas = { ...aliquotasParam };
  return new Promise((resolve, reject) => {
    Pessoa.findById(idPessoa)
      .select('Aliquotas')
      .then((doc) => {
        const pessoa = doc;

        if (pessoa.Aliquotas.length === 0) {
          aliquotas.ativo = true;
          aliquotas.validade = {};
          aliquotas.validade.inicio = new Date('01/01/1900');
          pessoa.Aliquotas.push(aliquotas);

          pessoa.save().then(() => {
            resolve();
          }).catch(err => reject(err));
        }
      }).catch(err => reject(err));
  });
}

function pegarEmpresaAliquotas(cnpj) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Aliquotas -_id')
      .then(({ Aliquotas: aliquotasArray }) => {
        const aliquota = aliquotasArray.find(el => el.ativo);
        resolve(aliquota);
      }).catch(err => reject(err));
  });
}

module.exports = {
  criarAliquota,
  pegarEmpresaAliquotas,
};
