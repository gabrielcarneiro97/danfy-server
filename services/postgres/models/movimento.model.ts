import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
  pgDate, // eslint-disable-line no-unused-vars
  pgBool, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Movimento extends Table {
  id : pgNum;
  notaFinalChave : pgStr;
  notaInicialChave : pgStr;
  valorSaida : pgNum;
  lucro : pgNum;
  dataHora : pgDate;
  conferido : pgBool;
  impostoId : pgNum;
  metaDadosId : pgNum;
  donoCpfcnpj : pgStr;

  static tbName = () => 'tb_movimento';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'nota_final_chave',
    'nota_inicial_chave',
    'valor_saida',
    'lucro',
    'data_hora',
    'conferido',
    'imposto_id',
    'meta_dados_id',
    'dono_cpfcnpj',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Movimento);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Movimento>(column, value, Movimento);
  }

  save() {
    return Table.save(this, Movimento);
  }
}
