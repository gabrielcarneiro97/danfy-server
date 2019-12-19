import Table, {
  pgNum, // eslint-disable-line no-unused-vars
  pgStr, // eslint-disable-line no-unused-vars
  pgDate, // eslint-disable-line no-unused-vars
  pgBool, // eslint-disable-line no-unused-vars
} from './table.model';

class MetaDados extends Table {
  mdId : pgNum;
  email : pgStr;
  mdDataHora : pgDate;
  tipo : pgStr;
  ativo : pgBool;
  refMovimentoId : pgNum;
  refServicoId : pgNum;

  static tbName = () => 'tb_meta_dados';
  static tbUK = () => 'md_id';
  static columns = () => [
    'md_id',
    'email',
    'md_data_hora',
    'tipo',
    'ativo',
    'ref_movimento_id',
    'ref_servico_id',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, MetaDados);
  }

  static async getBy(column : string | object, value? : string) {
    return Table.getty<MetaDados>(column, value, MetaDados);
  }

  save() {
    return Table.save(this, MetaDados);
  }

  del() {
    return Table.del(this, MetaDados);
  }
}

module.exports = MetaDados;
