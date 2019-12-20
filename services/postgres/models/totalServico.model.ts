import Table, {
  pgNum, // eslint-disable-line no-unused-vars
} from './table.model';

import Servico from './servico.model'; // eslint-disable-line no-unused-vars

export default class TotalServico extends Table {
  id : pgNum;
  total : pgNum;
  impostoId : pgNum;
  retencaoId : pgNum;

  static tbName = () => 'tb_total_servico';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'total',
    'imposto_id',
    'retencao_id',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, TotalServico);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<TotalServico>(column, value, TotalServico);
  }

  soma(servOuTotalServ : Servico | TotalServico) {
    if (servOuTotalServ instanceof Servico) this.total += servOuTotalServ.valor;
    else this.total += servOuTotalServ.total;
  }

  save() {
    return Table.save(this, TotalServico);
  }

  del() {
    return Table.del(this, TotalServico);
  }
}
