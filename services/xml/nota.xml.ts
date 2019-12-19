export default class NotaXml {
  chave : string;
  emitente : string;
  destinatario : string;

  geral : {
    dataHora : string,
    naturezaOperacao : string,
    numero : string,
    tipo : string,
    status : string,
    cfop : string,
  };

  informacoesEstaduais : {
    estadoGerador : string,
    estadoDestino : string,
    destinatarioContribuinte : string,
  };

  valor : { total : string };

  produtos? : object;

  complementar : {
    notaReferencia? : string,
    textoComplementar? : string,
  };
}
