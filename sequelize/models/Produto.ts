import {
  Model, Optional, DataTypes,
} from 'sequelize';

import sequelize from '..';

interface ProdutoAttrs {
  id : number
  descricao : string
  nome : string
  notaChave : string | null
  quantidade : number | null
  valor : number | null
}

interface ProdutoCreateAttrs extends Optional<ProdutoAttrs, 'id'> {}

export default class Produto extends Model<ProdutoAttrs, ProdutoCreateAttrs> {
  public id!: number;
  public descricao!: string;
  public nome!: string;
  public notaChave!: string | null;
  public quantidade!: number | null;
  public valor!: number | null;
}

Produto.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  descricao: DataTypes.STRING,
  nome: DataTypes.STRING,
  notaChave: {
    field: 'nota_chave',
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  valor: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_produto',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
