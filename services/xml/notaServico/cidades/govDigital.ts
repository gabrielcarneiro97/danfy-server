/* eslint dot-notation: 0 */
import {
  ElementCompact,
} from 'xml-js';

import NotaServicoXml, {
  Valor,
  Iss,
  Retencoes,
  Geral,
} from '../../notaServico.xml';

import EnderecoXml from '../../endereco.xml';

import PessoaXml from '../../pessoa.xml';

import NotaServicoPessoas from '../../notaServicoPessoas.xml';

function pad(num : string | number, size : number) {
  let s = `${num}`;
  while (s.length < size) s = `0${s}`;
  return s;
}

const getNfses = (obj : ElementCompact) : ElementCompact[] => [].concat(obj.GovDigital.emissao['nf-e']);

const getItens = (obj : ElementCompact) : any[] => {
  const { item } = obj.itens;

  if (Array.isArray(item)) {
    return item.map((i) => ({
      descricao: i.descricao?._text || '',
      valor: i.valor?._text || '0',
      aliquota: i.aliquota?._text || '0',
    }));
  }

  return [{
    descricao: item.descricao?._text || '',
    valor: item.valor?._text || '0',
    aliquota: item.aliquota?._text || '0',
  }];
};

const getRetencoes = (nfse : ElementCompact) : Retencoes => {
  let valores = nfse.deducoes?.deducao;

  const iss = nfse.valorImposto?._text || '0';

  const valorIss = nfse.retido['_text'] === '1' ? iss : '0';

  const vazio = {
    iss: valorIss,
    irpj: '0',
    csll: '0',
    cofins: '0',
    pis: '0',
    inss: '0',
  };

  if (!valores) return vazio;
  if (!Array.isArray(valores)) valores = [valores];

  const rets : Retencoes = valores.reduce((acc, crr) => {
    const val = crr['_text'];
    switch (crr['_attributes'].codigo) {
      case 'COFINS':
        return { ...acc, cofins: val };
      case 'PIS':
        return { ...acc, pis: val };
      case 'IRRF':
        return { ...acc, irpj: val };
      case 'CSLL':
        return { ...acc, csll: val };
      case 'INSS':
        return { ...acc, inss: val };
      default:
        return acc;
    }
  }, vazio);

  return rets;
};

const getIss = (nfse : ElementCompact) : Iss => {
  const aliq = getItens(nfse)[0].aliquota;

  return {
    valor: nfse.valorImposto?._text || '0',
    aliquota: aliq,
  };
};

const getValor = (nfse : ElementCompact) : Valor => ({
  servico: nfse.valorTotal?._text || '0',
  baseCalculo: nfse.valorBase?._text || '0',
  iss: getIss(nfse),
  retencoes: getRetencoes(nfse),
});

const getEndereco = (pessoa : ElementCompact) : EnderecoXml => ({
  logradouro: pessoa.logradouro?._text || '',
  numero: pessoa.numero?._text || '',
  complemento: pessoa.complemento?._text || '',
  bairro: pessoa.bairro?._text || '',
  municipio: {
    codigo: pessoa.municipio?._text || '',
  },
  estado: pessoa.estado?._text || '',
  pais: {
    nome: 'Brasil',
    codigo: '1058',
  },
  cep: pessoa.cep?._text || '',
});

const getEmitente = (nfse : ElementCompact) : PessoaXml => {
  const emitenteBruto = nfse.prestador;

  return {
    cpfcnpj: emitenteBruto.documento['_text'],
    nome: emitenteBruto.nome['_text'],
    endereco: getEndereco(emitenteBruto),
  };
};

const getDestinatario = (nfse : ElementCompact) : PessoaXml => {
  const destinatarioBruto = nfse.tomador;

  return {
    cpfcnpj: destinatarioBruto.documento['_text'],
    nome: destinatarioBruto.nome['_text'],
    endereco: getEndereco(destinatarioBruto),
  };
};

const getInfosGerais = (nfse : ElementCompact) : Geral => {
  const ano = new Date(nfse.prestacao['_text']).getFullYear();
  const num = nfse.numero['_text'];

  return {
    numero: `${ano}${pad(num, 11)}`,
    dataHora: nfse.prestacao['_text'],
    status: nfse.dataCancelamento ? 'CANCELADA' : 'NORMAL',
    descricao: getItens(nfse)[0].descricao,
  };
};

function lerNota(nfse : ElementCompact) : NotaServicoPessoas {
  const emitente = getEmitente(nfse);

  const destinatario = getDestinatario(nfse);


  const notaServico : NotaServicoXml = {
    valor: getValor(nfse),
    emitente: emitente.cpfcnpj,
    destinatario: destinatario.cpfcnpj,
    geral: getInfosGerais(nfse),
    chave: '',
  };

  notaServico.chave = notaServico.emitente + notaServico.geral.numero;

  return { notaServico, emitente, destinatario };
}

export default function govDigital(obj : ElementCompact) : NotaServicoPessoas[] {
  return getNfses(obj).map(lerNota);
}
