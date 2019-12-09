const Table = require('./table.model');

class Produto extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Produto);
  }

  static tbName() {
    return 'tb_produto';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'nome',
      'descricao',
      'quantidade',
      'valor',
      'nota_chave',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Produto);
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

module.exports = Produto;
