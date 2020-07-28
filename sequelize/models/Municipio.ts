import {
  Model, DataTypes,
} from 'sequelize';

import sequelize from '..';

interface MunicipioAttrs {
  id : number
  nome : string
}

export default class Municipio extends Model<MunicipioAttrs> {
  public id!: number;
  public nome!: string;
}

Municipio.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: DataTypes.STRING,
}, {
  tableName: 'tb_municipio',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
