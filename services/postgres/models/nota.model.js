const Table = require('./table.model');

class Nota extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Nota);
  }

  static tbName() {
    return 'tb_nota';
  }

  static tbUK() {
    return 'chave';
  }

  static columns() {
    return [
      'chave',
      'emitente_cpfcnpj',
      'destinatario_cpfcnpj',
      'texto_complementar',
      'cfop',
      'data_hora',
      'numero',
      'status',
      'tipo',
      'destinatario_contribuinte',
      'estado_destino_id',
      'estado_gerador_id',
      'valor',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Nota);
  }

  save() {
    return Table.save(this, Nota);
  }
}

module.exports = Nota;
