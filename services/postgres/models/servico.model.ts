import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
  pgDate, // eslint-disable-line no-unused-vars
  pgBool, // eslint-disable-line no-unused-vars
} from './table.model';

export default class Servico extends Table {
  id : pgNum;
  donoCpfcnpj : pgStr;
  notaChave : pgStr;
  retencaoId : pgNum;
  impostoId : pgNum;
  dataHora : pgDate;
  valor : pgNum;
  conferido : pgBool;
  metaDadosId : pgNum;
  grupoId : pgNum;

  static tbName = () => 'tb_servico';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'dono_cpfcnpj',
    'nota_chave',
    'retencao_id',
    'imposto_id',
    'data_hora',
    'valor',
    'conferido',
    'meta_dados_id',
    'grupo_id',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, Servico);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<Servico>(column, value, Servico);
  }

  save() {
    return Table.save(this, Servico);
  }

  del() {
    return Table.del(this, Servico);
  }
}
