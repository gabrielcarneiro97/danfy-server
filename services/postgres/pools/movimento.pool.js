const Pool = require('./pool');
const { pg } = require('../../pg.service');
const {
  ImpostoPool,
} = require('./');
const {
  Movimento,
  MetaDados,
} = require('../models');

class MovimentoPool extends Pool {
  constructor(movimento, metaDados, impostoPool) {
    super([movimento, metaDados, impostoPool]);
    this.movimento = movimento;
    this.metaDados = metaDados;
    this.impostoPool = impostoPool;
  }

  static async getById(id) {
    const [movimento] = await Movimento.getBy({ id });

    const [[impostoPool], [metaDados]] = await Promise.all([
      ImpostoPool.getById(movimento.impostoId),
      MetaDados.getBy({ mdId: movimento.metaDadosId }),
    ]);

    return new MovimentoPool(movimento, metaDados, impostoPool);
  }

  static async getByNotaFinal(notaChave) {
    const [movimentoPg] = pg.table('tb_movimento')
      .innerJoin('tb_meta_dados', 'tb_movimento.meta_dados_id', 'tb_meta_dados.md_id')
      .where('tb_movimento.nota_final_chave', notaChave)
      .andWhere('tb_meta_dados.ativo', true);

    if (movimentoPg) {
      const movimento = new Movimento(movimentoPg, true);
      const [[impostoPool], [metaDados]] = await Promise.all([
        ImpostoPool.getById(movimento.impostoId),
        MetaDados.getBy({ mdId: movimento.metaDadosId }),
      ]);

      return new MovimentoPool(movimento, metaDados, impostoPool);
    }

    return undefined;
  }

  async save() {
    const impostoId = await this.impostoPool.save();
    const metaDadosId = await this.metaDados.save();
    this.movimento.impostoId = impostoId;
    this.movimento.metaDadosId = metaDadosId;

    return this.movimento.save();
  }
}

MovimentoPool.getById(1).then(a => console.log(a));

module.exports = MovimentoPool;
