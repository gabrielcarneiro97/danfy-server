import NotaServicoPool from './pools/notaServico.pool';

import NotaServico from './models/notaServico.model';
import Retencao from './models/retencao.model';

import { objParseFloat } from '../calculador.service';

import NotaServicoXml from '../xml/notaServico.xml';


export async function criarNotaServico(notaServicoParam : { emitente : string; numero : string }) {
  return new NotaServico({
    chave: notaServicoParam.emitente + notaServicoParam.numero,
    ...notaServicoParam,
  }).save();
}

export async function pegarNotaServicoChave(chave : string) {
  return (await NotaServico.getBy({ chave }))[0];
}

export async function notaServicoXmlToPool(notaObj : NotaServicoXml) {
  const retObj = objParseFloat(notaObj.valor.retencoes);

  const retencao = new Retencao(retObj);
  retencao.totalize();

  const notaFlat = {
    chave: notaObj.chave,
    valor: parseFloat(notaObj.valor.servico),
    iss: parseFloat(notaObj.valor.iss.valor),
    emitenteCpfcnpj: notaObj.emitente,
    destinatarioCpfcnpj: notaObj.destinatario,
    ...notaObj.geral,
    dataHora: new Date(notaObj.geral.dataHora),
  };

  const notaServico = new NotaServico(notaFlat);

  const notaServicoPool = new NotaServicoPool(notaServico, retencao);
  await notaServicoPool.save();

  return notaServicoPool;
}
