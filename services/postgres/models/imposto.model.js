const Table = require('./table.model');

class Imposto extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Imposto);
  }

  static tbName() {
    return 'tb_imposto';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'cofins',
      'csll',
      'irpj',
      'pis',
      'total',
      'icms_id',
      'iss',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Imposto);
  }

  save() {
    return Table.save(this, Imposto);
  }
}

module.exports = Imposto;
