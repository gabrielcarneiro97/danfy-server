const Table = require('./table.model');

class TotalMovimento extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, TotalMovimento);
  }

  static tbName() {
    return 'tb_total_movimento';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'imposto_id',
      'valor_saida',
      'lucro',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, TotalMovimento);
  }

  soma({
    valorSaida,
    lucro,
  }) {
    this.valorSaida += valorSaida;
    this.lucro += lucro;
  }

  save() {
    return Table.save(this, TotalMovimento);
  }

  del() {
    return Table.del(this, TotalMovimento);
  }
}

module.exports = TotalMovimento;
