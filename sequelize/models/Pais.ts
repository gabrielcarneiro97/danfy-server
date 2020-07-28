import {
  Model, DataTypes,
} from 'sequelize';

import sequelize from '..';

interface PaisAttrs {
  id : number
  nome : string
}

export default class Pais extends Model<PaisAttrs> {
  public id!: number;
  public nome!: string;
}

Pais.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: DataTypes.STRING,
}, {
  tableName: 'tb_pais',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
