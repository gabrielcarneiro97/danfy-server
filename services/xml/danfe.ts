/* eslint dot-notation: 0 */
import {
  ElementCompact,
} from 'xml-js';

import NotaXml, {
  Valor,
  Complementar,
  InformacoesEstaduais,
  Geral,
} from './nota.xml';

import EnderecoXml from './endereco.xml';

import PessoaXml from './pessoa.xml';

import NotaPessoas from './notaPessoas.xml';

const getInfo = (obj : ElementCompact)
  : ElementCompact => (obj.nfeProc ? obj.nfeProc.NFe.infNFe : obj.NFe.infNFe);

const ambienteProducao = (obj : ElementCompact) => {
  const info = getInfo(obj);
  return info.ide.tpAmb['_text'] === '1';
};

const getChave = (obj : ElementCompact) => {
  const info = getInfo(obj);
  return info['_attributes'].Id.toString().split('NFe')[1];
};

const getEndereco = (obj : ElementCompact, emitOuDest : string) : EnderecoXml => {
  const info = getInfo(obj);
  const pessoa = info[emitOuDest];

  if (!pessoa) return null;

  const ender = emitOuDest === 'emit' ? pessoa['enderEmit'] : pessoa['enderDest'];

  if (!ender) return null;

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

const getPessoa = (obj : ElementCompact, emitOuDest : string) : PessoaXml => {
  const info = getInfo(obj);
  const pessoa = info[emitOuDest];

  return {
    nome: pessoa.xNome['_text'],
    cpfcnpj: pessoa.CNPJ ? pessoa.CNPJ['_text'] : pessoa.CPF['_text'],
    endereco: getEndereco(obj, emitOuDest),
  };
};

const getCFOP = (obj : ElementCompact) : string => {
  const info = getInfo(obj);
  const { det } = info;

  if (!Array.isArray(det)) {
    const { prod } = det;
    return prod.CFOP['_text'];
  }

  const { prod } = det[0];
  return prod.CFOP['_text'];
};

const getInfosGerais = (obj : ElementCompact) : Geral => {
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

const getInfosEstaduais = (obj : ElementCompact,
  emitente : PessoaXml, destinatario : PessoaXml) : InformacoesEstaduais => {
  const info = getInfo(obj);
  const { dest } = info;

  return {
    estadoGerador: emitente.endereco.estado,
    estadoDestino: destinatario.endereco.estado,
    destinatarioContribuinte: dest.indIEDest['_text'],
  };
};

const getValores = (obj : ElementCompact) : Valor => {
  const info = getInfo(obj);

  return {
    total: info.total.ICMSTot.vNF['_text'],
  };
};

const getProdutos = (obj : ElementCompact) : object => {
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

const getComplementar = (obj : ElementCompact) : Complementar => {
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

export function leitor(obj : ElementCompact) : NotaPessoas {
  if (!ambienteProducao(obj)) return null;

  const emitente = getPessoa(obj, 'emit');

  const destinatario = getPessoa(obj, 'dest');

  const nota : NotaXml = {
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

export function eDanfe(obj : ElementCompact) {
  return !!(obj.nfeProc && getInfo(obj));
}

export default {
  leitor,
  eDanfe,
};
