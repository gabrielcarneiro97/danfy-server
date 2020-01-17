import Table, {
  pgNum,
  pgStr,
} from './table.model';

export default class Pessoa extends Table {
  cpfcnpj : pgStr;
  nome : pgStr;
  enderecoId : pgNum;

  static tbName = () => 'tb_pessoa';
  static tbUK = () => 'cpfcnpj';
  static columns = () => [
    'cpfcnpj',
    'nome',
    'endereco_id',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Pessoa);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Pessoa>(column, value, Pessoa);
  }

  save() {
    return Table.save(this, Pessoa);
  }
}
