const Table = require('./table.model');

class Servico extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Servico);
  }

  static tbName() {
    return 'tb_servico';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'dono_cpfcnpj',
      'nota_chave',
      'retencao_id',
      'imposto_id',
      'data_hora',
      'valor',
      'conferido',
      'meta_dados_id',
      'grupo_id',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Servico);
  }

  save() {
    return Table.save(this, Servico);
  }

  del() {
    return Table.del(this, Servico);
  }
}

module.exports = Servico;
