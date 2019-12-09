const Table = require('./table.model');

class TotalServico extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, TotalServico);
  }

  static tbName() {
    return 'tb_total_servico';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'total',
      'imposto_id',
      'retencao_id',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, TotalServico);
  }

  soma({ valor }) {
    this.total += valor;
  }

  save() {
    return Table.save(this, TotalServico);
  }

  del() {
    return Table.del(this, TotalServico);
  }
}

module.exports = TotalServico;
