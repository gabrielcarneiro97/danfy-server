const Table = require('./table.model');
const { stringToDate } = require('../../calculador.service');
const { pg } = require('../../pg.service');

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
      'ativo',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, ProdutoEstoqueModel);
  }

  static async getByDonoAte(cpfcnpj, fimString) {
    const fim = stringToDate(fimString);
    const pgData = await pg.select('*').from('tb_estoque_produto')
      .where('dono_cpfcnpj', cpfcnpj)
      .andWhere('data_saida', '<=', fim);

    return pgData.map((o) => new ProdutoEstoqueModel(o, true));
  }

  save() {
    return Table.save(this, ProdutoEstoqueModel);
  }
}

module.exports = ProdutoEstoqueModel;
