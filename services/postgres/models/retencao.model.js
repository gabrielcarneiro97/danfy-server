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

  soma({
    iss,
    cofins,
    csll,
    irpj,
    pis,
    inss,
    total,
  }) {
    this.iss += iss;
    this.cofins += cofins;
    this.csll += csll;
    this.irpj += irpj;
    this.pis += pis;
    this.inss += inss;
    this.total += total;
  }

  totalize() {
    this.total = this.iss + this.cofins + this.csll + this.irpj + this.pis + this.inss;
  }

  save() {
    return Table.save(this, Retencao);
  }

  del() {
    return Table.del(this, Retencao);
  }
}

module.exports = Retencao;
