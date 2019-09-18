const Table = require('./table.model');

class ProdutoEstoqueModel extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, ProdutoEstoqueModel);
  }

  static tbName() {
    return 'tb_produto_estoque';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'produto_codigo',
      'nota_inicial_chave',
      'nota_final_chave',
      'valor_entrada',
      'data_entrada',
      'data_saida',
      'dono_cpfcnpj',
      'descricao',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, ProdutoEstoqueModel);
  }

  save() {
    return Table.save(this, ProdutoEstoqueModel);
  }
}

module.exports = ProdutoEstoqueModel;
