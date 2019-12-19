import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
} from './table.model';

class Grupo extends Table {
  id : pgNum;
  donoCpfcnpj : pgStr;
  nome : pgStr;
  descricao : pgStr;
  cor : pgStr;

  static tbName = () => 'tb_grupo';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'dono_cpfcnpj',
    'nome',
    'descricao',
    'cor',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Grupo);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Grupo>(column, value, Grupo);
  }

  save() {
    return Table.save(this, Grupo);
  }
}

module.exports = Grupo;
