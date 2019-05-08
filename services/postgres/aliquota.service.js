const { Pessoa } = require('../../models');

const { dtof } = require('../calculador.service');

const { pg } = require('../pg.service');

function criarAliquota(cpfcnpj, aliquotasParam) {
  const aliquotas = {
    ...aliquotasParam,
    dono_cpfcnpj: cpfcnpj,
    ativo: true,
  };
  return new Promise((resolve, reject) => {
    pg.from('tb_aliquota').where({
      dono_cpfcnpj: cpfcnpj,
      ativo: true,
    }).then(([aliquotaAntigaPg]) => {
      const antigaPromise = new Promise((resolveAntiga, rejectAntiga) => {
        if (aliquotaAntigaPg) {
          pg.table('tb_aliquota')
            .where('id', aliquotaAntigaPg.id)
            .update({
              ativo: false,
              validade: new Date(),
            })
            .then(() => resolveAntiga())
            .catch(e => rejectAntiga(e));
        } else resolveAntiga();
      });

      antigaPromise.then(() => {
        pg.table('tb_aliquota')
          .returning('id')
          .insert(aliquotas)
          .then(([id]) => {
            resolve(id);
          })
          .catch(e => reject(e));
      }).catch(e => reject(e));
    }).catch(e => reject(e));
  });
}

function pegarEmpresaAliquota(cpfcnpj) {
  return new Promise((resolve, reject) => {
    pg.from('tb_aliquota')
      .where({
        dono_cpfcnpj: cpfcnpj,
        ativo: true,
      }).then(([aliquotaPg]) => resolve(aliquotaPg))
      .catch(e => reject(e));
  });
}

module.exports = {
  criarAliquota,
  pegarEmpresaAliquota,
};
