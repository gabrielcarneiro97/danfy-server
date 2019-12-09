const Table = require('./table.model');

class Municipio extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Municipio);
  }

  static tbName() {
    return 'tb_municipio';
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
    return Table.getBy(column, value, Municipio);
  }

  save() {
    return Table.save(this, Municipio);
  }
}

module.exports = Municipio;
