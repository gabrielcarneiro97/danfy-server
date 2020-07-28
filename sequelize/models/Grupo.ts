import {
  Model, Optional, HasOneGetAssociationMixin, Association, DataTypes,
} from 'sequelize';

import sequelize from '..';
import Pessoa from './Pessoa';

interface GrupoAttrs {
  id : number
  cor : string | null
  descricao : string | null
  donoCpfcnpj : string | null
  nome : string | null
}

interface GrupoCreateAttrs extends Optional<GrupoAttrs, 'id'> {}

export default class Grupo extends Model<GrupoAttrs, GrupoCreateAttrs> {
  public id!: number;
  public cor!: string | null;
  public descricao!: string | null;
  public donoCpfcnpj!: string | null;
  public nome!: string | null;

  public getDono!: HasOneGetAssociationMixin<Pessoa>;

  public readonly dono?: Pessoa;

  public static associations: {
    dono: Association<Grupo, Pessoa>;
  }
}

Grupo.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  donoCpfcnpj: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'tb_grupo',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Grupo.hasOne(Pessoa, { foreignKey: 'id', sourceKey: 'donoCpfnpj', as: 'dono' });
