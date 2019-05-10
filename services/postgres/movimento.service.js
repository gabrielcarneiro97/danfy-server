const { pg } = require('../');

function mesInicioFim(competencia) {
  return {
    inicio: new Date(competencia.ano, competencia.mes - 1),
    fim: new Date(new Date(competencia.ano, competencia.mes) - 1),
  };
}

function selectMovimentos() {
  return pg.select([
    'mov.id',
    'mov.dono_cpfcnpj',
    'mov.nota_final_chave',
    'mov.nota_inicial_chave',
    'mov.valor_saida',
    'mov.lucro',
    'mov.data_hora',
    'mov.conferido',
    'md.ativo as md_ativo',
    'md.email as md_email',
    'md.md_data_hora as md_data_hora',
    'md.tipo as md_tipo',
    'md.ref_movimento_id as md_ref_movimento_id',
    'imp.cofins as imp_cofins',
    'imp.csll as imp_csll',
    'imp.irpj as imp_irpj',
    'imp.pis as imp_pis',
    'imp.total as imp_total',
    'icms.base_calculo as icms_base_calculo',
    'icms.composicao_base as icms_composicao_base',
    'icms.difal_destino as icms_difal_destino',
    'icms.difal_origem as icms_difal_origem',
    'icms.proprio as icms_proprio',
    'inicial.valor as incial_valor',
    'final.valor as final_valor',
  ])
    .from('tb_movimento as mov')
    .innerJoin('tb_imposto as imp', 'mov.imposto_id', 'imp.id')
    .innerJoin('tb_icms as icms', 'imp.icms_id', 'icms.id')
    .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id')
    .innerJoin('tb_nota as inicial', 'mov.nota_inicial_chave', 'inicial.chave')
    .innerJoin('tb_nota as final', 'mov.nota_final_chave', 'final.chave');
}

function movPgToObj(movPg) {
  const movimento = {
    imposto: {
      icms: {},
    },
    meta_dados: {},
  };

  Object.keys(movPg).forEach((key) => {
    if (key.startsWith('md_')) movimento.meta_dados[key.replace('md_', '')] = movPg[key];
    else if (key.startsWith('imp_')) movimento.imposto[key.replace('imp_', '')] = movPg[key];
    else if (key.startsWith('icms_')) movimento.imposto.icms[key.replace('icms_', '')] = movPg[key];
    else movimento[key] = movPg[key];
  });

  return movimento;
}

function movsPgToObjs(movsPg) {
  const movimentos = [];
  movsPg.forEach((movPg) => {
    movimentos.push(movPgToObj(movPg));
  });
  return movimentos;
}

function objToMovPg(movObj) {
  const movimento_imposto_icms = {
    ...movObj.imposto.icms,
  };
  const movimento_imposto = {
    ...movObj.imposto,
  };
  delete movimento_imposto.icms;
  const movimento_meta_dados = {
    ...movObj.meta_dados,
  };
  const movimento = {
    ...movObj,
  };
  delete movimento.imposto;
  delete movimento.meta_dados;
  delete movimento.inicial_valor;
  delete movimento.final_valor;
  delete movimento.id;

  return {
    movimento,
    movimento_meta_dados,
    movimento_imposto,
    movimento_imposto_icms,
  };
}

function criarMovimento(movObj) {
  const {
    movimento,
    movimento_meta_dados,
    movimento_imposto,
    movimento_imposto_icms,
  } = objToMovPg(movObj);
  return new Promise((resolve, reject) => {
    const impostoPromise = new Promise((impostoResolve, impostoReject) => {
      pg.insert(movimento_imposto_icms, 'id')
        .into('tb_icms')
        .then(([icms_id]) => {
          movimento_imposto.icms_id = icms_id;
          pg.insert(movimento_imposto, 'id')
            .into('tb_imposto')
            .then(([imposto_id]) => impostoResolve(imposto_id))
            .catch(impostoReject);
        })
        .catch(impostoReject);
    });

    const metaDadosPromise = new Promise((metaDadosResolve, metaDadosReject) => {
      pg.insert(movimento_meta_dados, 'id')
        .into('tb_meta_dados')
        .then(([meta_dados_id]) => metaDadosResolve(meta_dados_id))
        .catch(metaDadosReject);
    });

    Promise.all([
      impostoPromise,
      metaDadosPromise,
    ]).then(([imposto_id, meta_dados_id]) => {
      movimento.imposto_id = imposto_id;
      movimento.meta_dados_id = meta_dados_id;
      pg.insert(movimento, 'id')
        .into('tb_movimento')
        .then(([movimento_id]) => resolve(movimento_id))
        .catch(reject);
    }).catch(reject);
  });
}

function pegarMovimentoNotaFinal(chaveNota) {
  return new Promise((resolve, reject) => {
    selectMovimentos()
      .where('md.ativo', true)
      .andWhere('nota.final_chave', chaveNota)
      .then(([movPg]) => {
        resolve(movPgToObj(movPg));
      })
      .catch(reject);
  });
}

function pegarMovimentosMes(cnpj, competencia) {
  return new Promise((resolve, reject) => {
    const mes = mesInicioFim(competencia);

    selectMovimentos()
      .where('mov.dono_cpfcnpj', cnpj)
      .andWhere('md.ativo', true)
      .andWhere('mov.data_hora', '<=', mes.fim)
      .andWhere('mov.data_hora', '>=', mes.inicio)
      .then((movsPg) => {
        resolve(movsPgToObjs(movsPg));
      })
      .catch(e => reject(e));
  });
}

function pegarMovimentoId(id) {
  return new Promise((resolve, reject) => {
    selectMovimentos()
      .where('mov.id', id)
      .then(([movPg]) => resolve(movPgToObj(movPg)))
      .catch(reject);
  });
}

function pegarMetaDados(movId) {
  return new Promise((resolve, reject) => {
    pg.select('md.*')
      .from('tb_movimento as mov')
      .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id')
      .where('mov.id', movId)
      .then(([mdPg]) => resolve(mdPg))
      .catch(reject);
  });
}

function cancelarMovimento(id) {
  return new Promise((resolve, reject) => {
    pegarMetaDados(id).then(({ md_id }) => {
      pg.table('tb_meta_dados as md')
        .where({ md_id })
        .update({
          ativo: false,
        })
        .then(resolve)
        .catch(reject);
    }).catch(reject);
  });
}

module.exports = {
  criarMovimento,
  pegarMovimentoNotaFinal,
  pegarMovimentosMes,
  pegarMovimentoId,
  cancelarMovimento,
};
