export default class NotaXml {
  valor: {
    servico : string,
    baseCalculo : string,
    iss: {
        valor : string,
        aliquota : string,
    };
    retencoes: {
        iss : string,
        irpj : string,
        csll : string,
        cofins : string,
        pis : string,
        inss : string,
    };
  };

  emitente : string;

  destinatario : string;

  geral: {
      numero : string,
      dataHora : Date,
      status : string,
      descricao : string,
  };

  chave : string;
}
