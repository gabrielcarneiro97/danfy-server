export type Iss = {
  valor : string;
  aliquota : string;
}

export type Retencoes = {
  iss : string;
  irpj : string;
  csll : string;
  cofins : string;
  pis : string;
  inss : string;
};

export type Valor = {
  servico : string;
  baseCalculo : string;
  iss: Iss;
  retencoes: Retencoes;
}

export type Geral = {
  numero : string;
  dataHora : Date;
  status : string;
  descricao : string;
}

export default class NotaServicoXml {
  chave : string;
  geral: Geral;
  valor: Valor;
  emitente : string;
  destinatario : string;
}
