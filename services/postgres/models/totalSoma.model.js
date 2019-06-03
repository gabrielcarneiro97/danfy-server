const Table = require('./table.model');

class TotalSoma extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, TotalSoma);
  }

  static tbName() {
    return 'tb_total_soma';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'valor_movimento',
      'valor_servico',
      'imposto_id',
      'retencao_id',
      'acumulado_id',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, TotalSoma);
  }

  save() {
    return Table.save(this, TotalSoma);
  }
}

module.exports = TotalSoma;
