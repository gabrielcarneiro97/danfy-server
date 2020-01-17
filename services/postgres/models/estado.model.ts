import Table, {
  pgNum,
  pgStr,
} from './table.model';

export default class Estado extends Table {
  id : pgNum;
  nome : pgStr;
  sigla : pgStr;

  static tbName = () => 'tb_estado';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'nome',
    'sigla',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Estado);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Estado>(column, value, Estado);
  }

  static async getIdBySigla(sigla : string) {
    const [{ id }] = (await Estado.getBy({ sigla }));
    return id;
  }

  save() {
    return Table.save(this, Estado);
  }
}
