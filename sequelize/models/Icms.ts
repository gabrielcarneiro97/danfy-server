import { Model, Optional, DataTypes } from 'sequelize';

import sequelize from '..';

interface IcmsAttrs {
  id : number
  baseCalculo : number | null
  composicaoBase : number | null
  difalDestino : number | null
  difalOrigem : number | null
  proprio : number | null
}

interface IcmsCreateAttrs extends Optional<IcmsAttrs, 'id'> {}

export default class Icms extends Model<IcmsAttrs, IcmsCreateAttrs> {
  public id!: number;
  public baseCalculo!: number | null;
  public composicaoBase!: number | null;
  public difalDestino!: number | null;
  public difalOrigem!: number | null;
  public proprio!: number | null;
}

Icms.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  baseCalculo: {
    field: 'base_calculo',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  composicaoBase: {
    field: 'composicao_base',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  difalDestino: {
    field: 'difal_destino',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  difalOrigem: {
    field: 'difal_origem',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  proprio: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
},
{
  tableName: 'tb_icms',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
