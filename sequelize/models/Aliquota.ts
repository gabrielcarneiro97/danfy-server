import {
  Model, Optional, HasOneGetAssociationMixin, Association, DataTypes,
} from 'sequelize';

import sequelize from '..';

import Pessoa from './Pessoa';

interface AliquotaAttrs {
  id : number
  ativo : boolean
  cofins : number | null
  csll : number | null
  donoCpfcnpj : string | null
  formaPagamento : string | null
  icmsAliquota : number | null
  icmsReducao : number | null
  irpj : number | null
  iss : number | null
  issProfissional : boolean | null
  pis : number | null
  tributacao : string | null
  validade : Date | null
}

interface CreateAliquotaAttrs extends Optional<AliquotaAttrs, 'id'> {}

export default class Aliquota extends Model<AliquotaAttrs, CreateAliquotaAttrs> {
  public id!: number;
  public ativo!: boolean;
  public cofins!: number | null;
  public csll!: number | null;
  public donoCpfcnpj!: string | null;
  public formaPagamento!: string | null;
  public icmsAliquota!: number | null;
  public icmsReducao!: number | null;
  public irpj!: number | null;
  public iss!: number | null;
  public issProfissional!: boolean | null;
  public pis!: number | null;
  public tributacao!: string | null;
  public validade!: Date | null;

  public getDono!: HasOneGetAssociationMixin<Pessoa>;

  public readonly dono?: Pessoa;

  public static associations: {
    dono: Association<Aliquota, Pessoa>;
  }
}

Aliquota.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ativo: DataTypes.BOOLEAN,
  cofins: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  csll: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  donoCpfcnpj: {
    field: 'dono_cpfcnpj',
    type: DataTypes.STRING,
    allowNull: true,
  },
  formaPagamento: {
    field: 'forma_pagamento',
    type: DataTypes.STRING,
    allowNull: true,
  },
  icmsAliquota: {
    field: 'icms_aliquota',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  icmsReducao: {
    field: 'icms_reducao',
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
  issProfissional: {
    field: 'iss_profissional',
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  pis: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  tributacao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  validade: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'tb_aliquota',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Aliquota.hasOne(Pessoa, { foreignKey: 'cpfcpnj', sourceKey: 'donoCpfcnpj', as: 'dono' });
