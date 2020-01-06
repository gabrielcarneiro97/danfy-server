/* eslint dot-notation: 0 */

import * as fs from 'fs';
import {
  ElementCompact, // eslint-disable-line no-unused-vars
} from 'xml-js';

import { xmlToObj } from '../../xml';

/* eslint dot-notation: 0 */


import NotaServicoXml, { // eslint-disable-line no-unused-vars
  Valor, // eslint-disable-line no-unused-vars
  Iss, // eslint-disable-line no-unused-vars
  Retencoes, // eslint-disable-line no-unused-vars
  Geral, // eslint-disable-line no-unused-vars
} from '../../notaServico.xml';

import EnderecoXml from '../../endereco.xml'; // eslint-disable-line no-unused-vars

import PessoaXml from '../../pessoa.xml'; // eslint-disable-line no-unused-vars

import NotaServicoPessoas from '../../notaServicoPessoas.xml'; // eslint-disable-line no-unused-vars

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
  const valores = nfse.deducoes?.deducao;

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
  const emitenteBruto = nfse['ns3:PrestadorServico'];

  return {
    cpfcnpj: emitenteBruto['ns3:IdentificacaoPrestador']['ns3:Cnpj']['_text'],
    nome: emitenteBruto['ns3:RazaoSocial']['_text'],
    endereco: getEndereco(emitenteBruto),
  };
};

const getDestinatario = (nfse : ElementCompact) : PessoaXml => {
  const destinatarioBruto = nfse['ns3:TomadorServico'];

  return {
    cpfcnpj: destinatarioBruto['ns3:IdentificacaoTomador']['ns3:CpfCnpj']['ns3:Cpf']
      ? destinatarioBruto['ns3:IdentificacaoTomador']['ns3:CpfCnpj']['ns3:Cpf']['_text']
      : destinatarioBruto['ns3:IdentificacaoTomador']['ns3:CpfCnpj']['ns3:Cnpj']['_text'],
    nome: destinatarioBruto['ns3:RazaoSocial']['_text'],
    endereco: getEndereco(destinatarioBruto),
  };
};

const getInfosGerais = (nfse : ElementCompact) : Geral => {
  const ano = new Date(nfse['ns3:DataEmissao']['_text']).getFullYear();
  const num = nfse['ns3:IdentificacaoNfse']['ns3:Numero']['_text'];

  return {
    numero: `${ano}${pad(num, 11)}`,
    dataHora: nfse['ns3:DataEmissao']['_text'],
    status: nfse.nfseCancelamento ? 'CANCELADA' : 'NORMAL',
    descricao: nfse['ns3:Servico']['ns3:Discriminacao']['_text'].replace(/\|/g, '\n'),
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

export default function govDigital(obj : ElementCompact) : void /* NotaServicoPessoas[] */ {
  // if (!assinada(obj)) return 0;

  getNfses(obj).forEach((n) => console.log(getValor(n)));

  // const emitente = getEmitente(obj);

  // const destinatario = getDestinatario(obj);


  // const notaServico : NotaServicoXml = {
  //   valor: getValor(obj),
  //   emitente: emitente.cpfcnpj,
  //   destinatario: destinatario.cpfcnpj,
  //   geral: getInfosGerais(obj),
  //   chave: '',
  // };

  // notaServico.chave = notaServico.emitente + notaServico.geral.numero;

  // return [{ notaServico, emitente, destinatario }];
}

const file = fs.readFileSync('./govD.xml');
const file2 = fs.readFileSync('./ex.xml');

// console.log(xmlToObj({ buffer: file2 }).GovDigital.emissao['nf-e'][0].retido);

govDigital((xmlToObj({ buffer: file })));
