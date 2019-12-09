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
      'adicional_ir',
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

  calculaAdicional(valorMovimento, valorServico, aliquotaIr) {
    const baseLucro = aliquotaIr === 0.012 ? valorMovimento * 0.08 : valorMovimento * 0.32;
    const baseServico = valorServico * 0.32;

    const baseCalculo = baseLucro + baseServico;

    this.adicionalIr = baseCalculo > 60000 ? (baseCalculo - 60000) * 0.1 : 0;
  }

  del() {
    return Table.del(this, Imposto);
  }
}

module.exports = Imposto;
