import Table, {
  pgNum,
  pgStr,
} from './table.model';

export default class Municipio extends Table {
  id : pgNum;
  nome : pgStr;

  static tbName = () => 'tb_municipio';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'nome',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Municipio);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Municipio>(column, value, Municipio);
  }

  save() {
    return Table.save(this, Municipio);
  }
}
