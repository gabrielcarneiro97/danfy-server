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

  soma({
    baseCalculo,
    composicaoBase,
    difalDestino,
    difalOrigem,
    proprio,
  }) {
    this.baseCalculo += baseCalculo;
    this.composicaoBase += composicaoBase;
    this.difalDestino += difalDestino;
    this.difalOrigem += difalOrigem;
    this.proprio += proprio;
  }

  save() {
    return Table.save(this, Icms);
  }

  del() {
    return Table.del(this, Icms);
  }
}

module.exports = Icms;
