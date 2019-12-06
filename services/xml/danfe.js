/* eslint dot-notation: 0 */

const getInfo = (obj) => (obj.nfeProc ? obj.nfeProc.NFe.infNFe : obj.NFe.infNFe);

const ambienteProducao = (obj) => {
  const info = getInfo(obj);
  return info.ide.tpAmb['_text'] === '1';
};

const getChave = (obj) => {
  const info = getInfo(obj);
  return info['_attributes'].Id.split('NFe')[1];
};

const getEndereco = (obj, emitOuDest) => {
  const info = getInfo(obj);
  const pessoa = info[emitOuDest];

  if (!pessoa) return {};

  const ender = emitOuDest === 'emit' ? pessoa['enderEmit'] : pessoa['enderDest'];

  if (!ender) return {};

  return {
    logradouro: ender.xLgr['_text'],
    numero: ender.nro['_text'],
    complemento: ender.xCpl ? ender.xCpl['_text'] : '',
    bairro: ender.xBairro['_text'],
    municipio: {
      codigo: ender.cMun['_text'],
      nome: ender.xMun['_text'],
    },
    estado: ender.UF['_text'],
    pais: {
      codigo: ender.cPais ? ender.cPais['_text'] : '',
      nome: ender.xPais ? ender.xPais['_text'] : '',
    },
    cep: ender.CEP ? ender.CEP['_text'] : '',
  };
};

const getPessoa = (obj, emitOuDest) => {
  const info = getInfo(obj);
  const pessoa = info[emitOuDest];

  return {
    nome: pessoa.xNome['_text'],
    cpfcnpj: pessoa.CNPJ ? pessoa.CNPJ['_text'] : pessoa.CPF['_text'],
    endereco: getEndereco(obj, emitOuDest),
  };
};

const getCFOP = (obj) => {
  const info = getInfo(obj);
  const { det } = info;

  if (!Array.isArray(det)) {
    const { prod } = det;
    return prod.CFOP['_text'];
  }

  const { prod } = det[0];
  return prod.CFOP['_text'];
};

const getInfosGerais = (obj) => {
  const info = getInfo(obj);

  return {
    dataHora: info.ide.dhSaiEnt ? info.ide.dhSaiEnt['_text'] : info.ide.dhEmi['_text'],
    naturezaOperacao: info.ide.natOp['_text'],
    numero: info.ide.nNF['_text'],
    tipo: info.ide.tpNF['_text'],
    status: 'NORMAL',
    cfop: getCFOP(obj),
  };
};

const getInfosEstaduais = (obj, emitente, destinatario) => {
  const info = getInfo(obj);
  const { dest } = info;

  return {
    estadoGerador: emitente.endereco.estado,
    estadoDestino: destinatario.endereco.estado,
    destinatarioContribuinte: dest.indIEDest['_text'],
  };
};

const getValores = (obj) => {
  const info = getInfo(obj);

  return {
    total: info.total.ICMSTot.vNF['_text'],
  };
};

const getProdutos = (obj) => {
  const info = getInfo(obj);
  const { det } = info;
  const produtos = {};

  if (!Array.isArray(det)) {
    const { prod } = det;
    const codigo = prod.cProd['_text'].replace(/\.|#|\/|\[|\]|\$/g, '-');

    const produto = {
      descricao: prod.xProd['_text'],
      quantidade: {
        numero: prod.qCom['_text'],
        tipo: prod.uCom['_text'],
      },
      valor: {
        total: prod.vProd['_text'],
      },
    };

    produtos[codigo] = produto;
  } else {
    det.forEach((val) => {
      const { prod } = val;
      const codigo = prod.cProd['_text'].replace(/\.|#|\/|\[|\]|\$/g, '-');

      const produto = {
        descricao: prod.xProd['_text'],
        quantidade: {
          numero: prod.qCom['_text'],
          tipo: prod.uCom['_text'],
        },
        valor: {
          total: prod.vProd['_text'],
        },
      };

      produtos[codigo] = produto;
    });
  }

  return produtos;
};

const getComplementar = (obj) => {
  const info = getInfo(obj);

  let complementar;

  if (!Array.isArray(info.ide.NFref)) {
    complementar = {
      notaReferencia: info.ide.NFref ? info.ide.NFref.refNFe ? info.ide.NFref.refNFe['_text'] : '' : '', // eslint-disable-line
      textoComplementar: info.infAdic ? info.infAdic.infCpl ? info.infAdic.infCpl['_text'] : info.infAdic.infAdFisco ? info.infAdic.infAdFisco['_text'] : '' : '', // eslint-disable-line
    };
  } else {
    complementar = {
      notaReferencia: '',
      textoComplementar: '',
    };
  }

  return complementar;
};

function leitor(obj) {
  if (!ambienteProducao(obj)) return 0;

  const emitente = getPessoa(obj, 'emit');

  const destinatario = getPessoa(obj, 'dest');

  const nota = {
    chave: getChave(obj),
    emitente: emitente.cpfcnpj,
    destinatario: destinatario.cpfcnpj,
    informacoesEstaduais: getInfosEstaduais(obj, emitente, destinatario),
    geral: getInfosGerais(obj),
    valor: getValores(obj),
    produtos: getProdutos(obj),
    complementar: getComplementar(obj),
  };

  return { nota, emitente, destinatario };
}

function eDanfe(obj) {
  return !!(obj.nfeProc && getInfo(obj));
}

module.exports = {
  leitor,
  eDanfe,
};
