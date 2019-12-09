const Table = require('./table.model');

class Pessoa extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Pessoa);
  }

  static tbName() {
    return 'tb_pessoa';
  }

  static tbUK() {
    return 'cpfcnpj';
  }

  static columns() {
    return [
      'cpfcnpj',
      'nome',
      'endereco_id',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Pessoa);
  }

  save() {
    return Table.save(this, Pessoa);
  }
}

module.exports = Pessoa;
