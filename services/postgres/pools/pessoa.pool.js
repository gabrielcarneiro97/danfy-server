const Pool = require('./pool');

const { Pessoa } = require('../models');

class PessoaPool extends Pool {
  constructor(pessoa, endereco) {
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

    this.pessoa.enderecoId = enderecoId;

    return this.pessoa.save();
  }
}

module.exports = PessoaPool;
