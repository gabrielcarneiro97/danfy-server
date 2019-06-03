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

  save() {
    return Table.save(this, Produto);
  }
}

module.exports = Produto;
