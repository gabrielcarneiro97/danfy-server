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
  const cfopInicial = notaInicial.geral.cfop;
  const cfopFinal = notaFinal.geral.cfop;

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
  const dataInicial = new Date(notaInicial.geral.dataHora).getTime();
  const dataFinal = new Date(notaFinal.geral.dataHora).getTime();

  if (dataInicial <= dataFinal) {
    return true;
  }
  return false;
}

function validarMovimento(notaInicial, notaFinal) {
  if (!compararCFOP(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`O CFOP da Nota Inicial ${notaInicial.geral.numero} ${notaInicial.geral.cfop} não é valido para o CFOP da Nota Final ${notaFinal.geral.numero} ${notaFinal.geral.cfop}`) };
  } else if (!compararProduto(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`O produto da Nota Final ${notaFinal.geral.numero} não foi localizado na Nota Inicial ${notaInicial.geral.numero}!`) };
  } else if (!compararData(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`A data da Nota Final ${notaFinal.geral.numero} é anterior a data da Nota Inicial ${notaInicial.geral.numero}!`) };
  }
  return { isValid: true, error: null };
}

function dtof(num) {
  return parseFloat(num.toString());
}

module.exports = {
  validarMovimento,
  dtof,
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
