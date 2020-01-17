import Table, {
  pgNum,
  pgStr,
  pgDate,
  pgBool,
} from './table.model';


export default class Total extends Table {
  id : pgNum;
  donoCpfcnpj : pgStr;
  dataHora : pgDate;
  totalMovimentoId : pgNum;
  totalServicoId : pgNum;
  totalSomaId : pgNum;
  anual : pgBool;
  trimestral : pgBool;

  static tbName = () => 'tb_total';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'dono_cpfcnpj',
    'data_hora',
    'total_movimento_id',
    'total_servico_id',
    'total_soma_id',
    'anual',
    'trimestral',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Total);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Total>(column, value, Total);
  }

  save() {
    return Table.save(this, Total);
  }

  del() {
    return Table.del(this, Total);
  }
}
