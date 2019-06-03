const Table = require('./table.model');

class Retencao extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Retencao);
  }

  static tbName() {
    return 'tb_retencao';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'iss',
      'irpj',
      'pis',
      'cofins',
      'csll',
      'inss',
      'total',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Retencao);
  }

  save() {
    return Table.save(this, Retencao);
  }
}

module.exports = Retencao;
