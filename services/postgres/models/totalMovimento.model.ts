import Table, {
  pgNum, // eslint-disable-line no-unused-vars
} from './table.model';

import Movimento from './movimento.model'; // eslint-disable-line no-unused-vars

export default class TotalMovimento extends Table {
  id : pgNum;
  impostoId : pgNum;
  valorSaida : pgNum;
  lucro : pgNum;

  static tbName = () => 'tb_total_movimento';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'imposto_id',
    'valor_saida',
    'lucro',
  ];


  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, TotalMovimento);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<TotalMovimento>(column, value, TotalMovimento);
  }

  soma({
    valorSaida,
    lucro,
  } : Movimento | TotalMovimento) {
    this.valorSaida += valorSaida;
    this.lucro += lucro;
  }

  save() {
    return Table.save(this, TotalMovimento);
  }

  del() {
    return Table.del(this, TotalMovimento);
  }
}
