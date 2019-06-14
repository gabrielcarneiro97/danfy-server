const Pool = require('./pool');

const { Nota, Produto } = require('../models');

class NotaPool extends Pool {
  constructor(nota, produtos) {
    if (produtos) {
      super([nota].concat(produtos));
      this.produtos = produtos;
    } else {
      super(nota);
    }
    this.nota = nota;
  }

  static async getByChave(chave) {
    const [nota] = Nota.getBy({ chave });
    const produtos = Produto.getBy('nota_chave', chave);

    return new NotaPool(nota, produtos);
  }

  async save() {
    const notaId = await this.nota.save();
    if (this.produtos) this.produtos.forEach(produto => produto.save());
    return notaId;
  }
}

module.exports = NotaPool;
