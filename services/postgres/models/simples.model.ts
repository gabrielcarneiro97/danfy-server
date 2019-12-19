import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
  pgDate, // eslint-disable-line no-unused-vars
} from './table.model';
import { pg } from '../../pg.service';

import {
  mesInicioFim,
  Comp, // eslint-disable-line no-unused-vars
} from '../../calculador.service';

export default class Simples extends Table {
  id : pgNum;
  donoCpfcnpj : pgStr;
  dataHora : pgDate;
  totalServicos : pgNum;
  totalMovimentos : pgNum;
  totalMes : pgNum;
  totalRetido : pgNum;
  totalNaoRetido : pgNum;
  totalExercicio : pgNum;
  totalDoze : pgNum;

  static tbName = () => 'tb_simples';
  static tbUK = () => 'id';
  static columns = () => [
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

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Simples);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Simples>(column, value, Simples);
  }

  static async getByCnpjComp(cnpj : string, comp : Comp) {
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
