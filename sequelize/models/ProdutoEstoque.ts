import {
  Model, DataTypes, Optional, HasOneGetAssociationMixin, Association,
} from 'sequelize';

import sequelize from '..';
import Pessoa from './Pessoa';
import Nota from './Nota';

interface ProdutoEstoqueAttrs {
  id : number
  ativo : boolean | null
  dataEntrada : Date | null
  dataSaida : Date | null
  descricao : string | null
  donoCpfcnpj : string | null
  notaFinalChave : string | null
  notaInicialChave : string | null
  produtoCodigo : string | null
  valorEntrada : number | null
}

interface ProdutoEstoqueCreateAttrs extends Optional<ProdutoEstoqueAttrs, 'id'> {}

export default class ProdutoEstoque extends Model<ProdutoEstoqueAttrs, ProdutoEstoqueCreateAttrs> {
  public id!: number;
  public ativo!: boolean | null;
  public dataEntrada!: Date | null;
  public dataSaida!: Date | null;
  public descricao!: string | null;
  public donoCpfcnpj!: string | null;
  public notaFinalChave!: string | null;
  public notaInicialChave!: string | null;
  public produtoCodigo!: string | null;
  public valorEntrada!: number | null;

  public getDono!: HasOneGetAssociationMixin<Pessoa>;

  public readonly dono?: Pessoa;

  public getNotaFinal!: HasOneGetAssociationMixin<Nota>;

  public readonly notaFinal?: Nota;

  public getNotaInicial!: HasOneGetAssociationMixin<Nota>;

  public readonly notaInicial?: Nota;

  public static associations: {
    dono: Association<ProdutoEstoque, Pessoa>;
    notaFinal: Association<ProdutoEstoque, Nota>;
    notaInicial: Association<ProdutoEstoque, Nota>;
  }
}

ProdutoEstoque.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  dataEntrada: {
    field: 'data_entrada',
    type: DataTypes.DATE,
    allowNull: true,
  },
  dataSaida: {
    field: 'data_saida',
    type: DataTypes.DATE,
    allowNull: true,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  donoCpfcnpj: {
    field: 'dono_cpfcnpj',
    type: DataTypes.STRING,
    allowNull: true,
  },
  notaFinalChave: {
    field: 'nota_final_chave',
    type: DataTypes.STRING,
    allowNull: true,
  },
  notaInicialChave: {
    field: 'nota_inicial_chave',
    type: DataTypes.STRING,
    allowNull: true,
  },
  produtoCodigo: {
    field: 'produto_codigo',
    type: DataTypes.STRING,
    allowNull: true,
  },
  valorEntrada: {
    field: 'valor_entrada',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_produto_estoque',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

ProdutoEstoque.hasOne(Pessoa, { foreignKey: 'cpfcnpj', sourceKey: 'donoCpfcnpj', as: 'dono' });
ProdutoEstoque.hasOne(Nota, { foreignKey: 'chave', sourceKey: 'notaFinalChave', as: 'notaFinal' });
ProdutoEstoque.hasOne(Nota, { foreignKey: 'chave', sourceKey: 'notaInicialChave', as: 'notaInicial' });
