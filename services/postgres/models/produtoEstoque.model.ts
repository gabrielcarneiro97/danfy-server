import Table, {
  pgNum,
  pgStr,
  pgDate,
  pgBool,
} from './table.model';
import { pg } from '../../pg.service';
import { stringToDate } from '../../calculador.service';

export default class ProdutoEstoque extends Table {
  id : pgNum;
  produtoCodigo : pgStr;
  notaInicialChave : pgStr;
  notaFinalChave : pgStr;
  valorEntrada : pgNum;
  dataEntrada : pgDate;
  dataSaida : pgDate;
  donoCpfcnpj : pgStr;
  descricao : pgStr;
  ativo : pgBool;

  static tbName = () => 'tb_produto_estoque';
  static tbUK = () => 'id';
  static columns = () => [
    'id',
    'produto_codigo',
    'nota_inicial_chave',
    'nota_final_chave',
    'valor_entrada',
    'data_entrada',
    'data_saida',
    'dono_cpfcnpj',
    'descricao',
    'ativo',
  ];

  constructor(obj : object, isSnake? : boolean) {
    super(obj, isSnake, ProdutoEstoque);
  }


  static async getBy(column : string | object, value? : string) {
    return Table.getty<ProdutoEstoque>(column, value, ProdutoEstoque);
  }

  static async getByDonoAte(cpfcnpj : string, fimString? : string) : Promise<ProdutoEstoque[]> {
    let pgData;

    if (fimString) {
      const fim = stringToDate(fimString);
      pgData = await pg.select('*').from(ProdutoEstoque.tbName())
        .where('dono_cpfcnpj', cpfcnpj)
        .andWhere('data_entrada', '<=', fim);
    } else {
      pgData = await pg.select('*').from(ProdutoEstoque.tbName())
        .where('dono_cpfcnpj', cpfcnpj);
    }
    return pgData.map((o) => new ProdutoEstoque(o, true));
  }

  save() {
    return Table.save(this, ProdutoEstoque);
  }
}
