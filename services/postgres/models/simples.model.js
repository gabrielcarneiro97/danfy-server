const Table = require('./table.model');

const { pg } = require('../../pg.service');

const { mesInicioFim } = require('../../calculador.service');

class Simples extends Table {
  constructor(obj, isSnake) {
    super(obj, isSnake, Simples);
  }

  static tbName() {
    return 'tb_simples';
  }

  static tbUK() {
    return 'id';
  }

  static columns() {
    return [
      'id',
      'dono_cpfcnpj',
      'data_hora',
      'total_servicos',
      'total_movimentos',
      'total_mes',
      'total_retido',
      'total_nao_retido',
      'total_exercicio',
      'total_doze',
    ];
  }

  static async getBy(column, value) {
    return Table.getBy(column, value, Simples);
  }

  static async getByCnpjComp(cnpj, comp) {
    const mes = mesInicioFim(comp);

    const [simplesPg] = await pg.select('*')
      .from('tb_simples as simples')
      .where('simples.dono_cpfcnpj', cnpj)
      .andWhere('simples.data_hora', '<=', mes.fim)
      .andWhere('simples.data_hora', '>=', mes.inicio);

    if (!simplesPg) return null;

    return new Simples(simplesPg, true);
  }

  save() {
    return Table.save(this, Simples);
  }

  del() {
    return Table.del(this, Simples);
  }
}

module.exports = Simples;
