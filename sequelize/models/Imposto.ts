import {
  Model, Optional, DataTypes, HasOneGetAssociationMixin, HasOneCreateAssociationMixin,
} from 'sequelize';

import sequelize from '..';
import Icms from './Icms';

interface ImpostoAttrs {
  id : number
  adicionalIr : number | null
  cofins : number | null
  csll : number | null
  icmsId : number | null
  irpj : number | null
  iss : number | null
  pis : number | null
  total : number | null
}

interface ImpostoCreateAttrs extends Optional<
  ImpostoAttrs,
  'id'
> {}

export default class Imposto extends Model<ImpostoAttrs, ImpostoCreateAttrs> {
  public id!: number;
  public adicionalIr!: number | null;
  public cofins!: number | null;
  public csll!: number | null;
  public icmsId!: number | null;
  public irpj!: number | null;
  public iss!: number | null;
  public pis!: number | null;
  public total!: number | null;

  public getIcms!: HasOneGetAssociationMixin<Icms>;
  public createIcms!: HasOneCreateAssociationMixin<Icms>;

  public readonly icms?: Icms;
}

Imposto.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  adicionalIr: {
    field: 'adicional_ir',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  cofins: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  csll: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  icmsId: {
    field: 'icms_id',
    type: DataTypes.INTEGER,
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
  tableName: 'tb_imposto',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Imposto.hasOne(Icms, { foreignKey: 'id', sourceKey: 'icmsId', as: 'icms' });
