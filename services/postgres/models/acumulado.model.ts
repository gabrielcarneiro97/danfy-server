import Table, {
  pgNum,
} from './table.model';

export default class Acumulado extends Table {
  id : pgNum;
  pis : pgNum;
  cofins : pgNum;

  static tbName = () => 'tb_acumulado';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'pis',
    'cofins',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Acumulado);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Acumulado>(column, value, Acumulado);
  }

  save() {
    return Table.save(this, Acumulado);
  }

  del() {
    return Table.del(this, Acumulado);
  }
}
