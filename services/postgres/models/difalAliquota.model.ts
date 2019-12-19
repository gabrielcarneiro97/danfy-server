import Table, {
  pgNum, // eslint-disable-line no-unused-vars
} from './table.model';

export default class DifalAliquota extends Table {
  id : pgNum;
  estadoId : pgNum;
  interno : pgNum;
  externo : pgNum;

  static tbName = () => 'tb_difal_aliquota';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'estado_id',
    'interno',
    'externo',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, DifalAliquota);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<DifalAliquota>(column, value, DifalAliquota);
  }

  save() {
    return Table.save(this, DifalAliquota);
  }
}
