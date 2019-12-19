import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Dominio extends Table {
  id : pgNum;
  codigo : pgNum;
  numero : pgNum;
  cnpj : pgStr;

  static tbName = () => 'tb_dominio';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'codigo',
    'numero',
    'cnpj',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Dominio);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Dominio>(column, value, Dominio);
  }

  save() {
    return Table.save(this, Dominio);
  }
}
