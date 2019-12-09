const Table = require('./table.model');

class DifalAliquota extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, DifalAliquota);
  }

  static tbName() {
    return 'tb_difal_aliquota';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'estado_id',
      'interno',
      'externo',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, DifalAliquota);
  }

  save() {
    return Table.save(this, DifalAliquota);
  }
}

module.exports = DifalAliquota;
