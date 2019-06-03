const Table = require('./table.model');

class MetaDados extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, MetaDados);
  }

  static tbName() {
    return 'tb_meta_dados';
  }

  static tbUK() {
    return 'md_id';
  }

  static columns() {
    return [
      'md_id',
      'email',
      'md_data_hora',
      'tipo',
      'ativo',
      'ref_movimento_id',
      'ref_servico_id',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, MetaDados);
  }

  save() {
    return Table.save(this, MetaDados);
  }
}

module.exports = MetaDados;
