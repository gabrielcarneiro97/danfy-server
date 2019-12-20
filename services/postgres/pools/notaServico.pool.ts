import Pool from './pool';

import {
  pgType, // eslint-disable-line no-unused-vars
} from '../models/table.model';
import NotaServico from '../models/notaServico.model';
import Retencao from '../models/retencao.model';

export default class NotaServicoPool extends Pool {
  notaServico : NotaServico;
  retencao : Retencao;

  constructor(notaServico : NotaServico, retencao : Retencao) {
    super([notaServico, retencao]);
    this.notaServico = notaServico;
    this.retencao = retencao;
  }

  async save() {
    const retencaoId = await this.retencao.save();
    this.notaServico.retencaoId = <number> retencaoId;
    return this.notaServico.save();
  }

  static async getByChave(chave : pgType) {
    const [notaServico] = await NotaServico.getBy({ chave });
    const [retencao] = await Retencao.getBy('id', notaServico.retencaoId.toString());

    return new NotaServicoPool(notaServico, retencao);
  }
}
