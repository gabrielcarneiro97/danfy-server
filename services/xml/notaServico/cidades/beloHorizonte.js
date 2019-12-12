/* eslint dot-notation: 0 */

const getInfo = (obj) => obj.CompNfse.Nfse.InfNfse;

const assinada = (obj) => obj.CompNfse.Nfse.Signature;

const getRetencoes = (obj) => {
  const info = getInfo(obj);
  const valorBruto = info.Servico.Valores;

  return {
    iss: valorBruto.ValorIssRetido ? valorBruto.ValorIssRetido['_text'] : '0.0',
    irpj: valorBruto.ValorIr ? valorBruto.ValorIr['_text'] : '0.0',
    csll: valorBruto.ValorCsll ? valorBruto.ValorCsll['_text'] : '0.0',
    cofins: valorBruto.ValorCofins ? valorBruto.ValorCofins['_text'] : '0.0',
    pis: valorBruto.ValorPis ? valorBruto.ValorPis['_text'] : '0.0',
    inss: valorBruto.ValorInss ? valorBruto.ValorInss['_text'] : '0.0',
  };
};

const getIss = (obj) => {
  const info = getInfo(obj);
  const valorBruto = info.Servico.Valores;

  return {
    valor: valorBruto.ValorIss ? valorBruto.ValorIss['_text'] : '0.0',
    aliquota: valorBruto.Aliquota ? valorBruto.Aliquota['_text'] : '0.0',
  };
};

const getValor = (obj) => {
  const info = getInfo(obj);
  const valorBruto = info.Servico.Valores;

  return {
    servico: valorBruto.ValorServicos['_text'],
    baseCalculo: valorBruto.BaseCalculo['_text'],
    iss: getIss(obj),
    retencoes: getRetencoes(obj),
  };
};

const getEndereco = (pessoa) => ({
  logradouro: pessoa.Endereco.Endereco['_text'],
  numero: pessoa.Endereco.Numero['_text'],
  complemento: pessoa.Endereco.Complemento ? pessoa.Endereco.Complemento['_text'] : '',
  bairro: pessoa.Endereco.Bairro ? pessoa.Endereco.Bairro['_text'] : '',
  municipio: {
    codigo: pessoa.Endereco.CodigoMunicipio['_text'],
  },
  estado: pessoa.Endereco.Uf['_text'],
  pais: {
    nome: 'Brasil',
    codigo: '1058',
  },
  cep: pessoa.Endereco.Cep['_text'],
});

const getEmitente = (obj) => {
  const info = getInfo(obj);
  const emitenteBruto = info.PrestadorServico;

  return {
    cpfcnpj: emitenteBruto.IdentificacaoPrestador.Cnpj['_text'],
    nome: emitenteBruto.RazaoSocial['_text'],
    endereco: getEndereco(emitenteBruto),
  };
};

const getDestinatario = (obj) => {
  const info = getInfo(obj);
  const destinatarioBruto = info.TomadorServico;

  return {
    nome: destinatarioBruto.RazaoSocial['_text'],
    cpfcnpj: destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cpf ? destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cpf['_text'] : destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cnpj['_text'],
    endereco: getEndereco(destinatarioBruto),
  };
};

const getInfosGerais = (obj) => {
  const info = getInfo(obj);

  return {
    numero: info.Numero['_text'],
    dataHora: info.Competencia['_text'],
    status: obj.CompNfse.NfseCancelamento ? 'CANCELADA' : 'NORMAL',
    descricao: info.Servico.Discriminacao['_text'].replace(/\|/g, '\n'),
  };
};

function beloHorizonte(obj) {
  // if (!assinada(obj)) return 0;

  const emitente = getEmitente(obj);

  const destinatario = getDestinatario(obj);


  const notaServico = {
    valor: getValor(obj),
    emitente: emitente.cpfcnpj,
    destinatario: destinatario.cpfcnpj,
    geral: getInfosGerais(obj),
    chave: '',
  };

  notaServico.chave = notaServico.emitente + notaServico.geral.numero;

  return [{ notaServico, emitente, destinatario }];
}

module.exports = beloHorizonte;
