import {
  Model, DataTypes, Optional,
} from 'sequelize';

import sequelize from '..';

interface DominioAttrs {
  id : number
  cnpj : string | null
  codigo : string | null
  numero : string | null
}

interface DominioCreateAttrs extends Optional<DominioAttrs, 'id'> {}

export default class Dominio extends Model<DominioAttrs, DominioCreateAttrs> {
  public id!: number;
  public cnpj!: string | null;
  public codigo!: string | null;
  public numero!: string | null;
}

Dominio.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'tb_dominio',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
