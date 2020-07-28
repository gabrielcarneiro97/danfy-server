import {
  Model, Optional, DataTypes, Association, HasOneGetAssociationMixin, HasOneCreateAssociationMixin,
} from 'sequelize';

import sequelize from '..';
import Endereco from './Endereco';

interface PessoaAttrs {
  cpfcnpj : string
  enderecoId : number | null
  nome : string
}

interface PessoaCreateAttrs extends Optional<PessoaAttrs, 'enderecoId'> {}

export default class Pessoa extends Model<PessoaAttrs, PessoaCreateAttrs> {
  public cpfcnpj!: string;
  public enderecoId!: number | null;
  public nome!: string;

  public getEndereco!: HasOneGetAssociationMixin<Endereco>;
  public createEndereco!: HasOneCreateAssociationMixin<Endereco>;

  public readonly endereco?: Endereco;

  public static associations: {
    endereco: Association<Pessoa, Endereco>;
  };
}

Pessoa.init({
  cpfcnpj: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  enderecoId: {
    field: 'endereco_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  nome: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'tb_pessoa',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Pessoa.hasOne(Endereco, { foreignKey: 'id', sourceKey: 'enderecoId', as: 'endereco' });
