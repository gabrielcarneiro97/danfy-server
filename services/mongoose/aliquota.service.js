const { Pessoa } = require('../../models');

const { dtof } = require('../calculador.service');

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
        } else {
          const novasAliquotas = [];

          pessoa.Aliquotas.forEach((el) => {
            novasAliquotas.push({ ...el._doc, ativo: false });
          });

          aliquotas.ativo = true;
          aliquotas.validade = {};
          aliquotas.validade.inicio = new Date('01/01/1900');
          novasAliquotas.push(aliquotas);

          pessoa.Aliquotas = novasAliquotas;
        }

        pessoa.save().then(() => {
          resolve();
        }).catch(err => reject(err));
      }).catch(err => reject(err));
  });
}

function pegarEmpresaAliquotas(cnpj) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Aliquotas -_id')
      .then(({ Aliquotas: aliquotasArray }) => {
        let aliquota = aliquotasArray.find(el => el.ativo);

        aliquota = {
          ...aliquota,
          cofins: dtof(aliquota.cofins),
          csll: dtof(aliquota.csll),
          icms: {
            aliquota: dtof(aliquota.icms.aliquota),
            reducao: dtof(aliquota.icms.reducao),
          },
          irpj: dtof(aliquota.irpj),
          iss: dtof(aliquota.iss),
          pis: dtof(aliquota.pis),
        };
        resolve(aliquota);
      }).catch(err => reject(err));
  });
}

module.exports = {
  criarAliquota,
  pegarEmpresaAliquotas,
};
