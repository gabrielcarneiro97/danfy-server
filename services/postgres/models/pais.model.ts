import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Pais extends Table {
  id : pgNum;
  nome : pgStr;

  static tbName = () => 'tb_pais';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'nome',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Pais);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Pais>(column, value, Pais);
  }

  save() {
    return Table.save(this, Pais);
  }
}
