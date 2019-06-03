const Table = require('./table.model');

class NotaServico extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, NotaServico);
  }

  static tbName() {
    return 'tb_nota_servico';
  }

  static tbUK() {
    return 'chave';
  }

  static columns() {
    return [
      'chave',
      'emitente_cpfcnpj',
      'destinatario_cpfcnpj',
      'numero',
      'status',
      'data_hora',
      'retencao_id',
      'valor',
      'iss',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, NotaServico);
  }

  save() {
    return Table.save(this, NotaServico);
  }
}

module.exports = NotaServico;
