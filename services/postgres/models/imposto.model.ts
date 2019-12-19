import Table, {
  pgNum, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Imposto extends Table {
  id : pgNum;
  cofins : pgNum;
  csll : pgNum;
  irpj : pgNum;
  adicionalIr : pgNum;
  pis : pgNum;
  total : pgNum;
  icmsId : pgNum;
  iss : pgNum;

  static tbName = () => 'tb_imposto';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'cofins',
    'csll',
    'irpj',
    'adicional_ir',
    'pis',
    'total',
    'icms_id',
    'iss',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Imposto);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Imposto>(column, value, Imposto);
  }

  save() {
    return Table.save(this, Imposto);
  }

  del() {
    return Table.del(this, Imposto);
  }

  soma({
    cofins,
    csll,
    irpj,
    pis,
    iss,
    total,
  } : Imposto) {
    this.cofins += cofins;
    this.csll += csll;
    this.irpj += irpj;
    this.pis += pis;
    this.iss += iss;
    this.total += total;
  }

  calculaAdicional(valorMovimento : pgNum, valorServico : pgNum, aliquotaIr : pgNum) {
    const baseLucro = aliquotaIr === 0.012 ? valorMovimento * 0.08 : valorMovimento * 0.32;
    const baseServico = valorServico * 0.32;

    const baseCalculo = baseLucro + baseServico;

    this.adicionalIr = baseCalculo > 60000 ? (baseCalculo - 60000) * 0.1 : 0;
  }
}
