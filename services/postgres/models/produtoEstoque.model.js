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
    let pgData;

    if (fimString) {
      const fim = stringToDate(fimString);
      pgData = await pg.select('*').from(ProdutoEstoqueModel.tbName())
        .where('dono_cpfcnpj', cpfcnpj)
        .andWhere('data_entrada', '<=', fim);
    } else {
      pgData = await pg.select('*').from(ProdutoEstoqueModel.tbName())
        .where('dono_cpfcnpj', cpfcnpj);
    }
    return pgData.map((o) => new ProdutoEstoqueModel(o, true));
  }

  save() {
    return Table.save(this, ProdutoEstoqueModel);
  }
}

module.exports = ProdutoEstoqueModel;
