const Table = require('./table.model');

class Acumulado extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Acumulado);
  }

  static tbName() {
    return 'tb_acumulado';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'pis',
      'cofins',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Acumulado);
  }

  save() {
    return Table.save(this, Acumulado);
  }
}

module.exports = Acumulado;
