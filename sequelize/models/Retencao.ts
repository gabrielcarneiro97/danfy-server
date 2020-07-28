import { Model, Optional, DataTypes } from 'sequelize';

import sequelize from '..';

interface RetencaoAttrs {
  id : number
  cofins : number | null
  csll : number | null
  inss : number | null
  irpj : number | null
  iss : number | null
  pis : number | null
  total : number | null
}

interface RetencaoCreateAttrs extends Optional<RetencaoAttrs, 'id'> {}

export default class Retencao extends Model<RetencaoAttrs, RetencaoCreateAttrs> {
  public id!: number;
  public cofins!: number | null;
  public csll!: number | null;
  public inss!: number | null;
  public irpj!: number | null;
  public iss!: number | null;
  public pis!: number | null;
  public total!: number | null;
}

Retencao.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cofins: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  csll: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  inss: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  irpj: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  iss: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  pis: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_retencao',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
