import {
  Model, Optional, DataTypes, Association, HasOneGetAssociationMixin,
} from 'sequelize';

import sequelize from '..';
import Estado from './Estado';
import Municipio from './Municipio';
import Pais from './Pais';

interface EnderecoAttrs {
  id : number
  cep : string | null
  complemento : string | null
  estadoId : number | null
  logradouro : string | null
  bairro : string | null
  municipioId : number | null
  numero : string | null
  paisId : number | null
}

interface EnderecoCreateAttrs extends Optional<EnderecoAttrs, 'id'> {}

export default class Endereco extends Model<EnderecoAttrs, EnderecoCreateAttrs> {
  public id!: number;
  public cep!: string | null;
  public complemento!: string | null;
  public estadoId!: number | null;
  public logradouro!: string | null;
  public bairro!: string | null;
  public municipioId!: number | null;
  public numero!: string | null;
  public paisId!: number | null;

  public getEstado!: HasOneGetAssociationMixin<Estado>;

  public readonly estado?: Estado;

  public getMunicipio!: HasOneGetAssociationMixin<Municipio>;

  public readonly municipio?: Municipio;

  public getPais!: HasOneGetAssociationMixin<Pais>;

  public readonly pais?: Pais;

  public static associations: {
    estado: Association<Endereco, Estado>;
    municipio: Association<Endereco, Municipio>;
    pais: Association<Endereco, Pais>;
  }
}

Endereco.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cep: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  complemento: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estadoId: {
    field: 'estado_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  logradouro: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bairro: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  municipioId: {
    field: 'municipio_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paisId: {
    field: 'pais_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'tb_endereco',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Endereco.hasOne(Estado, { foreignKey: 'id', sourceKey: 'estadoId', as: 'estado' });
Endereco.hasOne(Municipio, { foreignKey: 'id', sourceKey: 'municipioId', as: 'municipio' });
Endereco.hasOne(Pais, { foreignKey: 'id', sourceKey: 'paisId', as: 'pais' });
