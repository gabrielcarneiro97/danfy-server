import Table, {
  pgNum,
  pgStr,
} from './table.model';

export default class Usuario extends Table {
  id : pgNum;
  dominioCodigo : pgStr;

  static tbName = () => 'tb_usuario';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'dominio_codigo',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Usuario);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Usuario>(column, value, Usuario);
  }

  save() {
    return Table.save(this, Usuario);
  }
}
