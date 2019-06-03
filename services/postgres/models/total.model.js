const Table = require('./table.model');

class Total extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Total);
  }

  static tbName() {
    return 'tb_total';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'dono_cpfcpj',
      'data_hora',
      'total_movimento_id',
      'total_servico_id',
      'total_soma_id',
      'anual',
      'trimestral',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Total);
  }

  save() {
    return Table.save(this, Total);
  }
}

module.exports = Total;
