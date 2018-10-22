const { ObjectId } = require('mongoose').Types;

const {
  Nota,
  Pessoa,
  NotaServico,
  Dominio,
  Usuario,
} = require('../models');

function criarNota(chave, notaParam) {
  return Nota.findByIdAndUpdate(chave, {
    _id: chave,
    ...notaParam,
  }, { upsert: true, runValidators: true });
}

function criarNotaServico(notaServicoParam) {
  return NotaServico
    .findByIdAndUpdate(
      notaServicoParam.emitente + notaServicoParam.geral.numero,
      notaServicoParam,
      { upsert: true, runValidators: true },
    );
}

function criarPessoa(_id, pessoaParam) {
  return Pessoa
    .findByIdAndUpdate(_id, { _id, ...pessoaParam }, { upsert: true, runValidators: true });
}

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

function criarMovimento(cnpj, movimento) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Movimentos').then((pessoa) => {
      pessoa.Movimentos.push(movimento);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarMovimentos(cnpj, movimentos) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Movimentos').then((pessoa) => {
      pessoa.Movimentos = pessoa.Movimentos.concat(movimentos);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarServico(cnpj, servico) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Servicos').then((pessoa) => {
      pessoa.Servico.push(servico);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarServicos(cnpj, servicos) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Servicos').then((pessoa) => {
      pessoa.Servicos = pessoa.Servicos.concat(servicos);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarTotais(cnpj, totais) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Totais').then((pessoa) => {
      pessoa.Totais = pessoa.Totais.concat(totais);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarDominio(_id, dominioParam) {
  const dominio = new Dominio({ _id, ...dominioParam });

  return dominio.save();
}

function criarUsuario(_id, usuarioParam) {
  const usuario = new Usuario({ _id, ...usuarioParam });

  return usuario.save();
}

function pegarMovimentosMes(cnpj, competencia) {
  const mes = parseInt(competencia.mes, 10);
  const ano = parseInt(competencia.ano, 10);
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Movimentos -_id')
      .then(({ Movimentos: todosMovs }) => {
        const movs = todosMovs.filter((el) => {
          const movMes = el.data.getMonth() + 1;
          const movAno = el.data.getFullYear();
          return mes === movMes && ano === movAno;
        });
        resolve(movs);
      }).catch(err => reject(err));
  });
}

function pegarMovimentoNotaFinal(cnpj, chaveNota) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Movimentos -_id')
      .then(({ Movimentos: movs }) => {
        const mov = movs.find(el => el.notaFinal === chaveNota && el.metaDados.status === 'ATIVO');
        if (movs.length !== 0) {
          resolve(mov);
        } else {
          reject(new Error('Mais de um documento ativo com a chave informada!'));
        }
      })
      .catch(err => reject(err));
  });
}

function pegarNotasProduto(id) {
  return new Promise((resolve, reject) => {
    if (id === 'INTERNO') {
      reject(new Error('Id inválido (INTERNO)'));
    } else {
      const find = `produtos.${id}`;
      Nota.find({
        [find]: { $exists: true },
      }).then(docs => resolve(docs)).catch(err => reject(err));
    }
  });
}

function pegarNotaChave(chave) {
  return Nota.findById(chave);
}

function pegarTotais(cnpj, competencia) {
  const mes = parseInt(competencia.mes, 10);
  const ano = parseInt(competencia.ano, 10);
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Totais -_id')
      .then(({ Totais: totais }) => {
        const total = totais.find((el) => {
          const totMes = el.competencia.getMonth() + 1;
          const totAno = el.competencia.getFullYear();
          return mes === totMes && ano === totAno;
        });
        resolve(total);
      }).catch(err => reject(err));
  });
}

function criarNotaSlim(notaParam) {
  const chave = new ObjectId();
  const nota = new Nota({
    _id: chave,
    chave,
    ...notaParam,
  });

  return nota.save();
}

function pegarServicosMes(cnpj, competencia) {
  const mes = parseInt(competencia.mes, 10);
  const ano = parseInt(competencia.ano, 10);
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Servicos -_id')
      .then(({ Servicos: todosSrvs }) => {
        const servicos = todosSrvs.filter((el) => {
          const srvMes = el.data.getMonth() + 1;
          const srvAno = el.data.getFullYear();
          return mes === srvMes && ano === srvAno;
        });
        resolve(servicos);
      }).catch(err => reject(err));
  });
}

function pegarNotaServicoChave(chave) {
  return NotaServico.findById(chave);
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

function gravarTotais(cnpj, dados, compObj) {
  const mes = parseInt(compObj.mes, 10) - 1;
  const ano = parseInt(compObj.ano, 10);

  const competencia = new Date(ano, mes, 1);

  const totais = { ...dados, competencia };

  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Totais')
      .then((pessoa) => {
        const totaisArray = pessoa.Totais;

        const checkComp = totaisArray.findIndex((el) => {
          const elComp = el.competencia;
          const elMes = elComp.getMonth();
          const elAno = elComp.getFullYear();

          return mes === elMes && ano === elAno;
        });

        if (checkComp !== -1) {
          pessoa.Totais[checkComp] = totais;
        } else {
          pessoa.Totais.push(totais);
        }


        pessoa.save().then(() => resolve()).catch(err => reject(err));
      }).catch(err => reject(err));
  });
}

// function excluirTotais() {
//   Pessoa
//     .updateMany({ Totais: { $exists: true } }, { $unset: { Totais: 1 } })
//     .then(a => console.log(a)).catch(err => console.error(err));
// }

module.exports = {
  criarNota,
  criarNotaSlim,
  criarPessoa,
  criarNotaServico,
  criarAliquota,
  criarMovimento,
  criarMovimentos,
  criarServico,
  criarServicos,
  criarTotais,
  criarDominio,
  criarUsuario,
  pegarServicosMes,
  pegarMovimentoNotaFinal,
  pegarMovimentosMes,
  pegarNotasProduto,
  pegarNotaChave,
  pegarTotais,
  pegarNotaServicoChave,
  pegarEmpresaAliquotas,
  gravarTotais,
};
