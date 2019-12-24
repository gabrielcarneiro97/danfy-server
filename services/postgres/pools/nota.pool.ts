import Pool from './pool';

import {
  pgType, // eslint-disable-line no-unused-vars
} from '../models/table.model';

import Nota from '../models/nota.model';
import Produto from '../models/produto.model';

export default class NotaPool extends Pool {
  nota : Nota;
  produtos : Produto[];

  constructor(nota : Nota, produtos? : Produto[]) {
    if (produtos) {
      super([nota, ...produtos]);
      this.produtos = produtos;
    } else {
      super([nota]);
    }
    this.nota = nota;
  }

  static async getByChave(chave : pgType) {
    const [nota] = await Nota.getBy({ chave });
    const produtos = await Produto.getBy('nota_chave', <string> chave);

    return new NotaPool(nota, produtos);
  }

  async save() {
    const notaId = await this.nota.save();
    if (this.produtos) await Promise.all(this.produtos.map(async (produto) => produto.save()));
    return notaId;
  }
}
