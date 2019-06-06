const Table = require('./table.model');

class Usuario extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Usuario);
  }

  static tbName() {
    return 'tb_usuario';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'dominio_codigo',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Usuario);
  }

  save() {
    return Table.save(this, Usuario);
  }
}

module.exports = Usuario;
