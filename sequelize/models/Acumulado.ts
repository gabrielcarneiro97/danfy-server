import {
  Model,
  Optional,
  DataTypes,
} from 'sequelize';

import sequelize from '..';

interface AcumuladoAttrs {
  id : number
  cofins : number | null
  pis : number | null
}

interface AcumuladoCreateAttrs extends Optional<AcumuladoAttrs, 'id'> {}

export default class Acumulado extends Model<AcumuladoAttrs, AcumuladoCreateAttrs> {
  public id!: number;
  public cofins!: number | null;
  public pis!: number | null;
}

Acumulado.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cofins: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  pis: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_acumulado',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
