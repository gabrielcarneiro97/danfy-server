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

const getNfses = (obj : ElementCompact) : ElementCompact[] => [].concat(obj['ns2:NFSE']['ns2:Nfse']);

const getRetencoes = (nfse : ElementCompact) : Retencoes => {
  const valores = nfse['ns3:Servico']['ns3:Valores'];

  return {
    iss: valores['ns3:ValorIssRetido'] ? valores['ns3:ValorIssRetido']['_text'] : '0.0',
    irpj: valores['ns3:ValorIr'] ? valores['ns3:ValorIr']['_text'] : '0.0',
    csll: valores['ns3:ValorCsll'] ? valores['ns3:ValorCsll']['_text'] : '0.0',
    cofins: valores['ns3:ValorCofins'] ? valores['ns3:ValorCofins']['_text'] : '0.0',
    pis: valores['ns3:ValorPis'] ? valores['ns3:ValorPis']['_text'] : '0.0',
    inss: valores['ns3:ValorInss'] ? valores['ns3:ValorInss']['_text'] : '0.0',
  };
};

const getIss = (nfse : ElementCompact) : Iss => {
  const valores = nfse['ns3:Servico']['ns3:Valores'];

  return {
    valor: valores['ns3:ValorIss'] ? valores['ns3:ValorIss']['_text'] : '0.0',
    aliquota: valores['ns3:Aliquota'] ? valores['ns3:Aliquota']['_text'] : '0.0',
  };
};

const getValor = (nfse : ElementCompact) : Valor => {
  const valores = nfse['ns3:Servico']['ns3:Valores'];

  return {
    servico: valores['ns3:ValorServicos']['_text'],
    baseCalculo: valores['ns3:BaseCalculo']['_text'],
    iss: getIss(nfse),
    retencoes: getRetencoes(nfse),
  };
};

const getEndereco = (pessoa : ElementCompact) : EnderecoXml => ({
  logradouro: pessoa['ns3:Endereco']['ns3:Endereco'] ? pessoa['ns3:Endereco']['ns3:Endereco']['_text'] : 'uknow',
  numero: pessoa['ns3:Endereco']['ns3:Numero'] ? pessoa['ns3:Endereco']['ns3:Numero']['_text'] : '0',
  complemento: pessoa['ns3:Endereco']['ns3:Complemento'] ? pessoa['ns3:Endereco']['ns3:Complemento']['_text'] || '' : '',
  bairro: pessoa['ns3:Endereco']['ns3:Bairro'] ? pessoa['ns3:Endereco']['ns3:Bairro']['_text'] : '',
  municipio: {
    codigo: pessoa['ns3:Endereco']['ns3:Cidade'] ? pessoa['ns3:Endereco']['ns3:Cidade']['_text'] : '',
  },
  estado: pessoa['ns3:Endereco']['ns3:Estado'] ? pessoa['ns3:Endereco']['ns3:Estado']['_text'] : 'MG',
  pais: {
    nome: 'Brasil',
    codigo: '1058',
  },
  cep: pessoa['ns3:Endereco']['ns3:Cep'] ? pessoa['ns3:Endereco']['ns3:Cep']['_text'] : '',
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

export default function contagem(obj : ElementCompact) : NotaServicoPessoas[] {
  const nfses = getNfses(obj);

  return nfses.map(lerNota);
}
