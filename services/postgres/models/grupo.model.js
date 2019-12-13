const Table = require('./table.model');

class Grupo extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Grupo);
  }

  static tbName() {
    return 'tb_grupo';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'dono_cpfcnpj',
      'nome',
      'descricao',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Grupo);
  }

  save() {
    return Table.save(this, Grupo);
  }
}

module.exports = Grupo;
