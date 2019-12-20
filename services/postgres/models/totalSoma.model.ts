import Table, {
  pgNum, // eslint-disable-line no-unused-vars
} from './table.model';

export default class TotalSoma extends Table {
  id : pgNum;
  valorMovimento : pgNum;
  valorServico : pgNum;
  impostoId : pgNum;
  retencaoId : pgNum;
  acumuladoId : pgNum;

  static tbName = () => 'tb_total_soma';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'valor_movimento',
    'valor_servico',
    'imposto_id',
    'retencao_id',
    'acumulado_id',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, TotalSoma);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<TotalSoma>(column, value, TotalSoma);
  }

  save() {
    return Table.save(this, TotalSoma);
  }

  del() {
    return Table.del(this, TotalSoma);
  }
}
