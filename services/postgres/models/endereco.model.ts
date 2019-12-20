import Table, {
  pgStr, // eslint-disable-line no-unused-vars
  pgNum, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Endereco extends Table {
  id : pgNum;
  logradouro : pgStr;
  numero : pgStr;
  cep : pgStr;
  complemento : pgStr;
  municipioId : pgNum;
  estadoId : pgNum;
  paisId : pgNum;

  static tbName = () => 'tb_endereco';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'logradouro',
    'numero',
    'cep',
    'complemento',
    'municipio_id',
    'estado_id',
    'pais_id',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Endereco);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Endereco>(column, value, Endereco);
  }

  save() {
    return Table.save(this, Endereco);
  }
}
