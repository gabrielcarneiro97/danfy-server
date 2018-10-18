/* eslint dot-notation: 0 */

function lerNfse(obj, callback) {
  if (!obj.CompNfse.Nfse.Signature) {
    return 0;
  }

  const info = obj.CompNfse.Nfse.InfNfse;
  const valorBruto = info.Servico.Valores;

  const notaServico = {};

  const valor = {
    servico: valorBruto.ValorServicos['_text'],
    baseDeCalculo: valorBruto.BaseCalculo['_text'],
    iss: {
      valor: valorBruto.ValorIss ? valorBruto.ValorIss['_text'] : '0.0',
      aliquota: valorBruto.Aliquota ? valorBruto.Aliquota['_text'] : '0.0',
    },
    retencoes: {
      iss: valorBruto.ValorIssRetido ? valorBruto.ValorIssRetido['_text'] : '0.0',
      irpj: valorBruto.ValorIr ? valorBruto.ValorIr['_text'] : '0.0',
      csll: valorBruto.ValorCsll ? valorBruto.ValorCsll['_text'] : '0.0',
      cofins: valorBruto.ValorCofins ? valorBruto.ValorCofins['_text'] : '0.0',
      pis: valorBruto.ValorPis ? valorBruto.ValorPis['_text'] : '0.0',
      inss: valorBruto.ValorInss ? valorBruto.ValorInss['_text'] : '0.0',
    },
  };

  notaServico.valor = valor;

  const emitenteBruto = info.PrestadorServico;

  notaServico.emitente = emitenteBruto.IdentificacaoPrestador.Cnpj['_text'];

  const emitente = {
    nome: emitenteBruto.RazaoSocial['_text'],
    endereco: {
      logradouro: emitenteBruto.Endereco.Endereco['_text'],
      numero: emitenteBruto.Endereco.Numero['_text'],
      complemento: emitenteBruto.Endereco.Complemento ? emitenteBruto.Endereco.Complemento['_text'] : null,
      bairro: emitenteBruto.Endereco.Bairro,
      municipio: {
        codigo: emitenteBruto.Endereco.CodigoMunicipio['_text'],
      },
      estado: emitenteBruto.Endereco.Uf['_text'],
      pais: {
        nome: 'Brasil',
        codigo: '1058',
      },
      cep: emitenteBruto.Endereco.Cep['_text'],
    },
  };

  const destinatarioBruto = info.TomadorServico;

  notaServico.destinatario = destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cpf ? destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cpf['_text'] : destinatarioBruto.IdentificacaoTomador.CpfCnpj.Cnpj['_text'];

  const destinatario = {
    nome: destinatarioBruto.RazaoSocial['_text'],
    endereco: {
      logradouro: destinatarioBruto.Endereco.Endereco['_text'],
      numero: destinatarioBruto.Endereco.Numero['_text'],
      complemento: destinatarioBruto.Endereco.Complemento ? destinatarioBruto.Endereco.Complemento['_text'] : null,
      bairro: destinatarioBruto.Endereco.Bairro,
      municipio: {
        codigo: destinatarioBruto.Endereco.CodigoMunicipio['_text'],
      },
      estado: destinatarioBruto.Endereco.Uf['_text'],
      pais: {
        nome: 'Brasil',
        codigo: '1058',
      },
      cep: destinatarioBruto.Endereco.Cep['_text'],
    },
  };

  notaServico.geral = {
    numero: info.Numero['_text'],
    dataHora: info.Competencia['_text'],
    status: obj.CompNfse.NfseCancelamento ? 'CANCELADA' : 'NORMAL',
  };

  notaServico.chave = notaServico.emitente + notaServico.geral.numero;

  return callback(notaServico, emitente, destinatario);
}

function lerNfe(obj, callback) {
  // if (obj.nfeProc) {
  //   if (!obj.nfeProc.NFe) {
  //     return 0
  //   } else if (!obj.nfeProc.NFe.Signature) {
  //     return 0
  //   }
  // } else if (!obj.NFe) {
  //   return 0
  // } else if (!obj.NFe.Signature) {
  //   return 0
  // }

  const info = obj.nfeProc ? obj.nfeProc.NFe.infNFe : obj.NFe.infNFe;

  if (!info.ide.tpAmb['_text'] === '1') return 0;

  const notaId = info['_attributes'].Id.split('NFe')[1];

  const { emit } = info;
  const emitenteId = emit.CNPJ['_text'];
  const emitente = {
    nome: emit.xNome['_text'],
    endereco: {
      logradouro: emit.enderEmit.xLgr['_text'],
      numero: emit.enderEmit.nro['_text'],
      complemento: emit.enderEmit.xCpl ? emit.enderEmit.xCpl['_text'] : '',
      bairro: emit.enderEmit.xBairro['_text'],
      municipio: {
        codigo: emit.enderEmit.cMun['_text'],
        nome: emit.enderEmit.xMun['_text'],
      },
      estado: emit.enderEmit.UF['_text'],
      pais: {
        codigo: emit.enderEmit.cPais ? emit.enderEmit.cPais['_text'] : '',
        nome: emit.enderEmit.xPais ? emit.enderEmit.xPais['_text'] : '',
      },
      cep: emit.enderEmit.CEP ? emit.enderEmit.CEP['_text'] : '',
    },
  };

  const { dest } = info;
  const destinatarioId = dest.CPF ? dest.CPF['_text'] : dest.CNPJ['_text'];
  const destinatario = {
    nome: dest.xNome['_text'],
    endereco: {
      logradouro: dest.enderDest.xLgr['_text'],
      numero: dest.enderDest.nro['_text'],
      complemento: dest.enderDest.xCpl ? dest.enderDest.xCpl['_text'] : '',
      bairro: dest.enderDest.xBairro['_text'],
      municipio: {
        codigo: dest.enderDest.cMun['_text'],
        nome: dest.enderDest.xMun['_text'],
      },
      estado: dest.enderDest.UF['_text'],
      pais: {
        codigo: dest.enderDest.cPais ? dest.enderDest.cPais['_text'] : '',
        nome: dest.enderDest.xPais ? dest.enderDest.xPais['_text'] : '',
      },
      cep: dest.enderDest.CEP ? dest.enderDest.CEP['_text'] : '',
    },
  };

  const nota = {
    chave: notaId,
    emitente: emitenteId,
    destinatario: destinatarioId,
    informacoesEstaduais: {
      estadoGerador: emitente.endereco.estado,
      estadoDestino: destinatario.endereco.estado,
      destinatarioContribuinte: dest.indIEDest['_text'],
    },
    geral: {
      dataHora: info.ide.dhSaiEnt ? info.ide.dhSaiEnt['_text'] : info.ide.dhEmi['_text'],
      naturezaOperacao: info.ide.natOp['_text'],
      numero: info.ide.nNF['_text'],
      tipo: info.ide.tpNF['_text'],
      status: 'NORMAL',
    },
    valor: {
      total: info.total.ICMSTot.vNF['_text'],
    },
  };

  const { det } = info;
  const produtos = {};
  const produtosCodigo = {};

  if (!Array.isArray(det)) {
    const { prod } = det;
    const codigo = prod.cProd['_text'].replace(/\.|#|\/|\[|\]|\$/g, '-');

    nota.geral.cfop = prod.CFOP['_text'];

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
    produtosCodigo[codigo] = true;
  } else {
    det.forEach((val) => {
      const { prod } = val;
      const codigo = prod.cProd['_text'].replace(/\.|#|\/|\[|\]|\$/g, '-');

      nota.geral.cfop = prod.CFOP['_text'];

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
      produtosCodigo[codigo] = true;
    });
  }

  nota.produtos = produtos;
  nota.produtosCodigo = produtosCodigo;

  if (!Array.isArray(info.ide.NFref)) {
    nota.complementar = {
      notaReferencia: info.ide.NFref ? info.ide.NFref.refNFe ? info.ide.NFref.refNFe['_text'] : '' : '', // eslint-disable-line
      textoComplementar: info.infAdic ? info.infAdic.infCpl ? info.infAdic.infCpl['_text'] : info.infAdic.infAdFisco ? info.infAdic.infAdFisco['_text'] : '' : '', // eslint-disable-line
    };
  } else {
    nota.complementar = {
      notaReferencia: '',
      textoComplementar: '',
    };
  }

  return callback(nota, emitente, destinatario);
}

module.exports = {
  lerNfe,
  lerNfse,
};
