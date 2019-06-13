const Pool = require('./pool');

const { Nota, Produto } = require('../models');

class NotaPool extends Pool {
  constructor(nota, produtos) {
    super([nota].concat(produtos));
    this.nota = nota;
    this.produtos = produtos;
  }

  static async getByChave(chave) {
    const [nota] = Nota.getBy({ chave });
    const produtos = Produto.getBy('nota_chave', chave);

    return new NotaPool(nota, produtos);
  }

  async save() {
    const notaId = await this.nota.save();
    this.produtos.forEach(async produto => produto.save());
    return notaId;
  }
}

module.exports = NotaPool;
