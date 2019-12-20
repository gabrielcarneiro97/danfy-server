import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
  pgDate, // eslint-disable-line no-unused-vars
} from './table.model';

export default class NotaServico extends Table {
  chave : pgStr;
  emitenteCpfcnpj : pgStr;
  destinatarioCpfcnpj : pgStr;
  numero : pgStr;
  status : pgStr;
  dataHora : pgDate;
  retencaoId : pgNum;
  valor : pgNum;
  iss : pgNum;
  descricao : pgStr;

  static tbName = () => 'tb_nota_servico';
  static tbUK = () => 'chave';
  static columns = () => [
    'chave',
    'emitente_cpfcnpj',
    'destinatario_cpfcnpj',
    'numero',
    'status',
    'data_hora',
    'retencao_id',
    'valor',
    'iss',
    'descricao',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, NotaServico);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<NotaServico>(column, value, NotaServico);
  }

  save() {
    return Table.save(this, NotaServico);
  }
}
