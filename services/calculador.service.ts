export const cfopCompra = ['1102', '2102'];
export const cfopDevolucao = ['1202', '2202'];
export const cfopDevolucaoCompra = ['5202'];
export const cfopVenda = ['5102', '6102', '6108'];
export const cfopConsignacao = ['1917', '2917'];
export const cfopCompraConsignacao = ['1113'];
export const cfopVendaConsignacao = ['5115', '6115', '5114'];
export const cfopDevolucaoConsignacao = ['5918', '6918'];
export const cfopDevolucaoDemonstracao = ['6913', '5913'];

export type Comp = { mes : string | number; ano : string | number };
export type Periodo = { inicio : string | Date; fim : string | Date };

export function compararCFOP(notaInicial, notaFinal) {
  const cfopInicial = notaInicial.cfop;
  const cfopFinal = notaFinal.cfop;

  if (cfopCompra.includes(cfopInicial) && cfopVenda.includes(cfopFinal)) {
    return true;
  } if (cfopCompraConsignacao.includes(cfopInicial)
    && cfopVendaConsignacao.includes(cfopFinal)) {
    return true;
  } if (cfopConsignacao.includes(cfopInicial)
    && cfopCompraConsignacao.includes(cfopFinal)) {
    return true;
  } if (cfopConsignacao.includes(cfopInicial)
    && cfopDevolucaoConsignacao.includes(cfopFinal)) {
    return true;
  } if (cfopVenda.includes(cfopInicial)
    && cfopDevolucao.includes(cfopFinal)) {
    return true;
  } if (cfopDevolucao.includes(cfopInicial)
    && cfopVenda.includes(cfopFinal)) {
    return true;
  } if (cfopCompra.includes(cfopInicial)
    && cfopDevolucaoCompra.includes(cfopFinal)) {
    return true;
  } if ((cfopVenda.includes(cfopInicial)
    && cfopVenda.includes(cfopFinal))
    && (notaFinal.emitente !== notaInicial.emitente)) {
    return true;
  }
  return false;
}

export function compararProduto(notaInicialPool, notaFinalPool) {
  let retorno = false;

  notaInicialPool.produtos.forEach((produtoInicial) => {
    notaFinalPool.produtos.forEach((produtoFinal) => {
      if (produtoFinal.nome === produtoInicial.nome) retorno = true;
      else if (produtoFinal.descricao === produtoInicial.descricao) retorno = true;
    });
  });

  return retorno;
}

export function compararData(notaInicial, notaFinal) {
  const dataInicial = new Date(notaInicial.dataHora).getTime();
  const dataFinal = new Date(notaFinal.dataHora).getTime();

  if (dataInicial <= dataFinal) {
    return true;
  }
  return false;
}

export function validarMovimento(notaInicialPool, notaFinalPool) {
  const notaInicial = notaInicialPool.nota;
  const notaFinal = notaFinalPool.nota;

  if (notaInicial.chave === notaFinal.chave) {
    return { isValid: false, error: new Error('A nota Inicial e Final são iguais!') };
  }
  if (!compararCFOP(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`O CFOP da Nota Inicial ${notaInicial.numero} ${notaInicial.cfop} não é valido para o CFOP da Nota Final ${notaFinal.numero} ${notaFinal.cfop}`) };
  } if (!compararProduto(notaInicialPool, notaFinalPool)) {
    return { isValid: false, error: new Error(`O produto da Nota Final ${notaFinal.numero} não foi localizado na Nota Inicial ${notaInicial.numero}!`) };
  } if (!compararData(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`A data da Nota Final ${notaFinal.numero} é anterior a data da Nota Inicial ${notaInicial.numero}!`) };
  }
  return { isValid: true, error: null };
}

export function dtof(num) {
  return parseFloat(num.toString());
}

export function mesInicioFim(competencia : Comp) {
  return {
    inicio: new Date(<number> competencia.ano, <number> competencia.mes - 1),
    fim: new Date(new Date(<number> competencia.ano, <number> competencia.mes).getTime() - 1),
  };
}

export function stringToDate(date : string | Date) {
  if (date instanceof Date) return date;

  const [dia, mes, ano] : string[] = date.split('-');

  return new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, parseInt(dia, 10));
}

export function trim(mesParam) {
  const mes = parseInt(mesParam, 10);
  if ((mes - 1) % 3 === 0) return [mes];
  if ((mes - 2) % 3 === 0) return [mes - 1, mes];
  return [mes - 2, mes - 1, mes];
}

export function objParseFloat(obj : object) : object {
  const ret = {};
  Object.keys(obj).forEach((k) => {
    ret[k] = parseFloat(obj[k]);
  });

  return ret;
}

export function getMesTrim(mesParam : string | number) {
  const mes = parseInt(mesParam.toString(), 10);
  const meses = {
    1: [1, 2, 3],
    4: [4, 5, 6],
    7: [7, 8, 9],
    10: [10, 11, 12],
  };
  if (meses[1].includes(mes)) return 1;
  if (meses[4].includes(mes)) return 4;
  if (meses[7].includes(mes)) return 7;
  return 10;
}

export function ultimosDoze(comp) {
  const meses = [];

  const atual = comp;
  for (let i = 12; i >= 1; i -= 1) {
    let mes = atual.mes - i;
    let { ano } = atual;
    if (mes <= 0) {
      ano -= 1;
      mes += 12;
    }

    meses.push({ mes, ano });
  }

  return meses;
}

export function mesesExercicio(comp) {
  const meses = [];

  for (let i = 1; i <= comp.mes; i += 1) {
    meses.push({ mes: i, ano: comp.ano });
  }

  return meses;
}

export function compToStr(comp) {
  return `${comp.mes}/${comp.ano}`;
}

export function strToComp(str) {
  const [mes, ano] = str.split('/');

  return { mes: parseInt(mes, 10), ano: parseInt(ano, 10) };
}

export function dateToComp(date) {
  const d = new Date(date);

  return { mes: d.getMonth() + 1, ano: d.getFullYear() };
}

export function compToDate(comp) {
  return new Date(comp.ano, comp.mes - 1);
}
