const Table = require('./table.model');

class Dominio extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Dominio);
  }

  static tbName() {
    return 'tb_dominio';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'codigo',
      'numero',
      'cnpj',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Dominio);
  }

  save() {
    return Table.save(this, Dominio);
  }
}

module.exports = Dominio;
