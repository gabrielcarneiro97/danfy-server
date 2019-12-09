const Table = require('./table.model');

class Aliquota extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Aliquota);
  }

  static tbName() {
    return 'tb_aliquota';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'cofins',
      'pis',
      'csll',
      'irpj',
      'iss',
      'icms_aliquota',
      'icms_reducao',
      'forma_pagamento',
      'tributacao',
      'ativo',
      'validade',
      'dono_cpfcnpj',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Aliquota);
  }

  save() {
    return Table.save(this, Aliquota);
  }
}

module.exports = Aliquota;
