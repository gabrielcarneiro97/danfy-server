import TotalPool from './pools/total.pool';

import {
  getMesTrim,
  Comp,
} from '../calculador.service';

export async function gravarTotalPool(totalPool : TotalPool) {
  return totalPool.save();
}

export async function pegarMesTotalPool(cnpj : string, competencia : Comp) {
  return TotalPool.getByCnpjComp(cnpj, competencia, 1);
}

export async function pegarTrimestreTotalPool(cnpj : string, competencia : Comp) {
  const mes = getMesTrim(competencia.mes);
  return TotalPool.getByCnpjComp(cnpj, { ...competencia, mes }, 3);
}
