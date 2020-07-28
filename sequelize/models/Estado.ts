import {
  Model, DataTypes,
} from 'sequelize';

import sequelize from '..';

interface EstadoAttrs {
  id : number
  nome : string
  sigla : string
}

export default class Estado extends Model<EstadoAttrs> {
  public id!: number;
  public nome!: string;
  public sigla!: string;
}

Estado.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: DataTypes.STRING,
  sigla: DataTypes.STRING,
}, {
  tableName: 'tb_estado',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
