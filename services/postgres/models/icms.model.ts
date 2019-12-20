import Table, {
  pgNum, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Icms extends Table {
  id : pgNum;
  baseCalculo : pgNum;
  composicaoBase : pgNum;
  difalDestino : pgNum;
  difalOrigem : pgNum;
  proprio : pgNum;

  static tbName = () => 'tb_icms';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'base_calculo',
    'composicao_base',
    'difal_destino',
    'difal_origem',
    'proprio',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Icms);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Icms>(column, value, Icms);
  }

  soma({
    baseCalculo,
    composicaoBase,
    difalDestino,
    difalOrigem,
    proprio,
  } : Icms) {
    this.baseCalculo += baseCalculo;
    this.composicaoBase += composicaoBase;
    this.difalDestino += difalDestino;
    this.difalOrigem += difalOrigem;
    this.proprio += proprio;
  }

  save() {
    return Table.save(this, Icms);
  }

  del() {
    return Table.del(this, Icms);
  }
}
