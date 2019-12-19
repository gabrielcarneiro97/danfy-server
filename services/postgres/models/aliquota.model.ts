import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
  pgDate, // eslint-disable-line no-unused-vars
  pgBool, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Aliquota extends Table {
  id : pgNum;
  cofins : pgNum;
  pis : pgNum;
  csll : pgNum;
  irpj : pgNum;
  iss : pgNum;
  icmsAliquota : pgNum;
  icmsReducao : pgNum;
  formaPagamento : pgStr;
  tributacao : pgStr;
  ativo : pgBool;
  validade : pgDate;
  donoCpfcnpj : pgStr;

  static tbName = () => 'tb_aliquota';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'cofins',
    'pis',
    'csll',
    'irpj',
    'iss',
    'icms_aliquota',
    'icms_reducao',
    'forma_pagamento',
    'tributacao',
    'ativo',
    'validade',
    'dono_cpfcnpj',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Aliquota);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Aliquota>(column, value, Aliquota);
  }

  save() {
    return Table.save(this, Aliquota);
  }
}
