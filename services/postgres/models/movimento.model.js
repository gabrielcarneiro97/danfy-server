const Table = require('./table.model');

class Movimento extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Movimento);
  }

  static tbName() {
    return 'tb_movimento';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'nota_final_chave',
      'nota_inicial_chave',
      'valor_saida',
      'lucro',
      'data_hora',
      'conferido',
      'imposto_id',
      'meta_dados_id',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Movimento);
  }

  save() {
    return Table.save(this, Movimento);
  }
}

module.exports = Movimento;
