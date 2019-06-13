const cfopCompra = ['1102', '2102'];
const cfopDevolucao = ['1202', '2202'];
const cfopDevolucaoCompra = ['5202'];
const cfopVenda = ['5102', '6102', '6108'];
const cfopConsignacao = ['1917', '2917'];
const cfopCompraConsignacao = ['1113'];
const cfopVendaConsignacao = ['5115', '6115', '5114'];
const cfopDevolucaoConsignacao = ['5918', '6918'];
const cfopDevolucaoDemonstracao = ['6913', '5913'];

function compararCFOP(notaInicial, notaFinal) {
  const cfopInicial = notaInicial.cfop;
  const cfopFinal = notaFinal.cfop;

  if (cfopCompra.includes(cfopInicial) && cfopVenda.includes(cfopFinal)) {
    return true;
  } else if (cfopCompraConsignacao.includes(cfopInicial) &&
    cfopVendaConsignacao.includes(cfopFinal)) {
    return true;
  } else if (cfopConsignacao.includes(cfopInicial) &&
    cfopCompraConsignacao.includes(cfopFinal)) {
    return true;
  } else if (cfopConsignacao.includes(cfopInicial) &&
    cfopDevolucaoConsignacao.includes(cfopFinal)) {
    return true;
  } else if (cfopVenda.includes(cfopInicial) &&
    cfopDevolucao.includes(cfopFinal)) {
    return true;
  } else if (cfopDevolucao.includes(cfopInicial) &&
    cfopVenda.includes(cfopFinal)) {
    return true;
  } else if (cfopCompra.includes(cfopInicial) &&
    cfopDevolucaoCompra.includes(cfopFinal)) {
    return true;
  } else if ((cfopVenda.includes(cfopInicial) &&
    cfopVenda.includes(cfopFinal)) &&
    (notaFinal.emitente !== notaInicial.emitente)) {
    return true;
  }
  return false;
}

function compararProduto(notaInicial, notaFinal) {
  let retorno = false;

  Object.keys(notaInicial.produtos).forEach((nomeProdutoInicial) => {
    Object.keys(notaFinal.produtos).forEach((nomeProdutoFinal) => {
      if (nomeProdutoFinal === nomeProdutoInicial) {
        retorno = true;
      } else if (notaInicial.produtos[nomeProdutoInicial].descricao ===
        notaFinal.produtos[nomeProdutoFinal].descricao) {
        retorno = true;
      }
    });
  });

  return retorno;
}

function compararData(notaInicial, notaFinal) {
  const dataInicial = new Date(notaInicial.data_hora).getTime();
  const dataFinal = new Date(notaFinal.data_hora).getTime();

  if (dataInicial <= dataFinal) {
    return true;
  }
  return false;
}

function validarMovimento(notaInicial, notaFinal) {
  if (!compararCFOP(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`O CFOP da Nota Inicial ${notaInicial.numero} ${notaInicial.cfop} não é valido para o CFOP da Nota Final ${notaFinal.numero} ${notaFinal.cfop}`) };
  } else if (!compararProduto(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`O produto da Nota Final ${notaFinal.numero} não foi localizado na Nota Inicial ${notaInicial.numero}!`) };
  } else if (!compararData(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`A data da Nota Final ${notaFinal.numero} é anterior a data da Nota Inicial ${notaInicial.numero}!`) };
  }
  return { isValid: true, error: null };
}

function dtof(num) {
  return parseFloat(num.toString());
}

function mesInicioFim(competencia) {
  return {
    inicio: new Date(competencia.ano, competencia.mes - 1),
    fim: new Date(new Date(competencia.ano, competencia.mes) - 1),
  };
}

function trim(mes) {
  mes = parseInt(mes, 10);
  if ((mes - 1) % 3 === 0) return [mes];
  else if ((mes - 2) % 3 === 0) return [mes - 1, mes];
  return [mes - 2, mes - 1, mes];
}

function objParseFloat(obj) {
  Object.keys(obj).forEach((k) => { obj[k] = parseFloat(obj[k]); });
}

module.exports = {
  validarMovimento,
  dtof,
  mesInicioFim,
  trim,
  objParseFloat,
  cfopCompra,
  cfopDevolucao,
  cfopDevolucaoCompra,
  cfopVenda,
  cfopConsignacao,
  cfopCompraConsignacao,
  cfopVendaConsignacao,
  cfopDevolucaoConsignacao,
  cfopDevolucaoDemonstracao,
};
