const Table = require('./table.model');

class Icms extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Icms);
  }

  static tbName() {
    return 'tb_icms';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'base_calculo',
      'composicao_base',
      'difal_destino',
      'difal_origem',
      'proprio',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Icms);
  }

  save() {
    return Table.save(this, Icms);
  }
}

module.exports = Icms;
