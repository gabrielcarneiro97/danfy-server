import Table, {
  pgNum,
} from './table.model';

export default class Retencao extends Table {
  id : pgNum;
  iss : pgNum;
  irpj : pgNum;
  pis : pgNum;
  cofins : pgNum;
  csll : pgNum;
  inss : pgNum;
  total : pgNum;

  static tbName = () => 'tb_retencao';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'iss',
    'irpj',
    'pis',
    'cofins',
    'csll',
    'inss',
    'total',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Retencao);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Retencao>(column, value, Retencao);
  }

  soma({
    iss,
    cofins,
    csll,
    irpj,
    pis,
    inss,
    total,
  } : Retencao) {
    this.iss += iss;
    this.cofins += cofins;
    this.csll += csll;
    this.irpj += irpj;
    this.pis += pis;
    this.inss += inss;
    this.total += total;
  }

  totalize() {
    this.total = this.iss + this.cofins + this.csll + this.irpj + this.pis + this.inss;
  }

  save() {
    return Table.save(this, Retencao);
  }

  del() {
    return Table.del(this, Retencao);
  }
}
