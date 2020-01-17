export type Geral = {
  dataHora : string;
  naturezaOperacao : string;
  numero : string;
  tipo : string;
  status : string;
  cfop : string;
}

export type InformacoesEstaduais = {
  estadoGerador : string;
  estadoDestino : string;
  destinatarioContribuinte : string;
}

export type Valor = { total : string };

export type Complementar = {
  notaReferencia? : string;
  textoComplementar? : string;
};

export default class NotaXml {
  chave : string;
  emitente : string;
  destinatario : string;
  geral : Geral;
  informacoesEstaduais : InformacoesEstaduais;
  valor : Valor;
  complementar : Complementar;
  produtos? : object;
}
