const Table = require('./table.model');

class Estado extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Estado);
  }

  static tbName() {
    return 'tb_estado';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'nome',
      'sigla',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Estado);
  }

  save() {
    return Table.save(this, Estado);
  }
}

module.exports = Estado;
