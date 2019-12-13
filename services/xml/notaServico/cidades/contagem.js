/* eslint dot-notation: 0 */

function pad(num, size) {
  let s = `${num}`;
  while (s.length < size) s = `0${s}`;
  return s;
}

const getNfses = (obj) => [].concat(obj['ns2:NFSE']['ns2:Nfse']);

const getRetencoes = (nfse) => {
  const valores = nfse['ns3:Servico']['ns3:Valores'];

  return {
    iss: valores['ns3:ValorISSRetido'] ? valores['ns3:ValorISSRetido']['_text'] : '0.0',
    irpj: valores['ns3:ValorIR'] ? valores['ns3:ValorIR']['_text'] : '0.0',
    csll: valores['ns3:ValorCSLL'] ? valores['ns3:ValorCSLL']['_text'] : '0.0',
    cofins: valores['ns3:ValorCOFINS'] ? valores['ns3:ValorCOFINS']['_text'] : '0.0',
    pis: valores['ns3:ValorPIS'] ? valores['ns3:ValorPIS']['_text'] : '0.0',
    inss: valores['ns3:ValorINSS'] ? valores['ns3:ValorINSS']['_text'] : '0.0',
  };
};

const getIss = (nfse) => {
  const valores = nfse['ns3:Servico']['ns3:Valores'];

  return {
    valor: valores['ns3:ValorIss'] ? valores['ns3:ValorIss']['_text'] : '0.0',
    aliquota: valores['ns3:Aliquota'] ? valores['ns3:Aliquota']['_text'] : '0.0',
  };
};

const getValor = (nfse) => {
  const valores = nfse['ns3:Servico']['ns3:Valores'];

  return {
    servico: valores['ns3:ValorServicos']['_text'],
    baseCalculo: valores['ns3:BaseCalculo']['_text'],
    iss: getIss(nfse),
    retencoes: getRetencoes(nfse),
  };
};

const getEndereco = (pessoa) => ({
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

const getEmitente = (nfse) => {
  const emitenteBruto = nfse['ns3:PrestadorServico'];

  return {
    cpfcnpj: emitenteBruto['ns3:IdentificacaoPrestador']['ns3:Cnpj']['_text'],
    nome: emitenteBruto['ns3:RazaoSocial']['_text'],
    endereco: getEndereco(emitenteBruto),
  };
};

const getDestinatario = (nfse) => {
  const destinatarioBruto = nfse['ns3:TomadorServico'];

  return {
    cpfcnpj: destinatarioBruto['ns3:IdentificacaoTomador']['ns3:CpfCnpj']['ns3:Cpf']
      ? destinatarioBruto['ns3:IdentificacaoTomador']['ns3:CpfCnpj']['ns3:Cpf']['_text']
      : destinatarioBruto['ns3:IdentificacaoTomador']['ns3:CpfCnpj']['ns3:Cnpj']['_text'],
    nome: destinatarioBruto['ns3:RazaoSocial']['_text'],
    endereco: getEndereco(destinatarioBruto),
  };
};

const getInfosGerais = (nfse) => {
  const ano = new Date(nfse['ns3:DataEmissao']['_text']).getFullYear();
  const num = nfse['ns3:IdentificacaoNfse']['ns3:Numero']['_text'];

  return {
    numero: `${ano}${pad(num, 11)}`,
    dataHora: nfse['ns3:DataEmissao']['_text'],
    status: nfse.nfseCancelamento ? 'CANCELADA' : 'NORMAL',
    descricao: nfse['ns3:Servico']['ns3:Discriminacao']['_text'].replace(/\|/g, '\n'),
  };
};

function lerNota(nfse) {
  const emitente = getEmitente(nfse);

  const destinatario = getDestinatario(nfse);


  const notaServico = {
    valor: getValor(nfse),
    emitente: emitente.cpfcnpj,
    destinatario: destinatario.cpfcnpj,
    geral: getInfosGerais(nfse),
    chave: '',
  };

  notaServico.chave = notaServico.emitente + notaServico.geral.numero;

  return { notaServico, emitente, destinatario };
}

function contagem(obj) {
  const nfses = getNfses(obj);

  return nfses.map(lerNota);
}


module.exports = contagem;
