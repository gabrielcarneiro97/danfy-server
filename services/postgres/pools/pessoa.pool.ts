import Pool from './pool';

import Pessoa from '../models/pessoa.model';
import Endereco from '../models/endereco.model';

export default class PessoaPool extends Pool {
  pessoa : Pessoa;
  endereco : Endereco;

  constructor(pessoa : Pessoa, endereco : Endereco) {
    super([pessoa, endereco]);

    this.pessoa = pessoa;
    this.endereco = endereco;
  }

  async save() {
    const [pessoaPg] = await Pessoa.getBy({ cpfcnpj: this.pessoa.cpfcnpj });
    if (pessoaPg) {
      this.endereco.id = pessoaPg.enderecoId;
    }

    const enderecoId = await this.endereco.save();

    this.pessoa.enderecoId = <number> enderecoId;

    return this.pessoa.save();
  }
}
