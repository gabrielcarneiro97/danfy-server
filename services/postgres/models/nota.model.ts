import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
  pgDate, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Nota extends Table {
  chave : pgStr;
  emitenteCpfcnpj : pgStr;
  destinatarioCpfcnpj : pgStr;
  textoComplementar : pgStr;
  cfop : pgStr;
  dataHora : pgDate;
  numero : pgStr;
  status : pgStr;
  tipo : pgStr;
  destinatarioContribuinte : pgStr;
  estadoDestinoId : pgNum;
  estadoGeradorId : pgNum;
  valor : pgNum;

  static tbName = () => 'tb_nota';
  static tbUK = () => 'chave';
  static columns = () => [
    'chave',
    'emitente_cpfcnpj',
    'destinatario_cpfcnpj',
    'texto_complementar',
    'cfop',
    'data_hora',
    'numero',
    'status',
    'tipo',
    'destinatario_contribuinte',
    'estado_destino_id',
    'estado_gerador_id',
    'valor',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Nota);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Nota>(column, value, Nota);
  }

  save() {
    return Table.save(this, Nota);
  }
}
