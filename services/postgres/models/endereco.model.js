const Table = require('./table.model');

class Endereco extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Endereco);
  }

  static tbName() {
    return 'tb_endereco';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'logradouro',
      'numero',
      'cep',
      'complemento',
      'municipio_id',
      'estado_id',
      'pais_id',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Endereco);
  }

  save() {
    return Table.save(this, Endereco);
  }
}

module.exports = Endereco;
