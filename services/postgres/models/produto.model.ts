import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Produto extends Table {
  id : pgNum;
  nome : pgStr;
  descricao : pgStr;
  quantidade : pgNum;
  valor : pgNum;
  notaChave : pgStr;

  static tbName = () => 'tb_produto';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'nome',
    'descricao',
    'quantidade',
    'valor',
    'nota_chave',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Produto);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Produto>(column, value, Produto);
  }

  async save() {
    if (!this.id) {
      const [check] = await Produto.getBy({ notaChave: this.notaChave, nome: this.nome });
      if (check) {
        this.id = check.id;
      }
    }
    return Table.save(this, Produto);
  }
}
