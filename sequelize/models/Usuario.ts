import { Model, DataTypes } from 'sequelize';

import sequelize from '..';

interface UsuarioAttrs {
  id : string
  dominioCodigo : string | null
}

export default class Usuario extends Model<UsuarioAttrs> {
  public id!: string;
  public dominioCodigo!: string | null;
}

Usuario.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  dominioCodigo: {
    field: 'dominio_codigo',
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'tb_usuario',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
