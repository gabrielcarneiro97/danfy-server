const Table = require('./table.model');

class Pais extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Pais);
  }

  static tbName() {
    return 'tb_pais';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'nome',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Pais);
  }

  save() {
    return Table.save(this, Pais);
  }
}

module.exports = Pais;
