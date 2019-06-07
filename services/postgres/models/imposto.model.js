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

  soma({
    cofins,
    csll,
    irpj,
    pis,
    iss,
    total,
  }) {
    this.cofins += cofins;
    this.csll += csll;
    this.irpj += irpj;
    this.pis += pis;
    this.iss += iss;
    this.total += total;
  }

  del() {
    return Table.delete(this, Imposto);
  }
}

module.exports = Imposto;
