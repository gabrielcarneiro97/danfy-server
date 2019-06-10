const Pool = require('./pool');

class PessoaPool extends Pool {
  constructor(pessoa, endereco) {
    super([pessoa, endereco]);

    this.pessoa = pessoa;
    this.endereco = endereco;
  }

  async save() {
    const enderecoId = await this.endereco.save();

    this.pessoa.enderecoId = enderecoId;

    return this.pessoa.save();
  }
}

module.exports = PessoaPool;
