import {
  Model,
  DataTypes,
  HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin,
  Association,
  HasOneSetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';

import sequelize from '..';

import Pessoa from './Pessoa';
import Produto from './Produto';

interface NotaAttrs {
  chave : string
  cfop : string | null
  dataHora : Date | null
  destinatarioContribuite : string | null
  destinatarioCpfcnpj : string
  emitenteCpfcnpj : string
  estadoDestinoId : number | null
  estadoGeradorId : number | null
  numero : string | null
  status : string | null
  textoComplementar : string | null
  tipo : string | null
  valor : number | null
}

export default class Nota extends Model<NotaAttrs> {
  public chave!: string;
  public cfop!: string | null;
  public dataHora!: Date | null;
  public destinatarioContribuite!: string | null;
  public destinatarioCpfcnpj!: string;
  public emitenteCpfcnpj!: string;
  public estadoDestinoId!: number | null;
  public estadoGeradorId!: number | null;
  public numero!: string | null;
  public status!: string | null;
  public textoComplementar!: string | null;
  public tipo!: string | null;
  public valor!: number | null;

  public getDestinatario!: HasOneGetAssociationMixin<Pessoa>;
  public createDestinatario!: HasOneCreateAssociationMixin<Pessoa>;
  public setDestinatario!: HasOneSetAssociationMixin<Pessoa, string>;

  public readonly destinatario?: Pessoa;

  public getEmitente!: HasOneGetAssociationMixin<Pessoa>;
  public createEmitente!: HasOneCreateAssociationMixin<Pessoa>;
  public setEmitente!: HasOneSetAssociationMixin<Pessoa, string>;

  public readonly emitente?: Pessoa;

  public getProdutos!: HasManyGetAssociationsMixin<Produto>;

  public readonly produtos?: Produto[];

  public static associations: {
    destinatario: Association<Nota, Pessoa>;
    emitente: Association<Nota, Pessoa>;
    produtos: Association<Nota, Produto>;
  }
}

Nota.init({
  chave: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  cfop: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dataHora: {
    field: 'data_hora',
    type: DataTypes.DATE,
    allowNull: true,
  },
  destinatarioContribuite: {
    field: 'destinatario_contribuinte',
    type: DataTypes.STRING,
    allowNull: true,
  },
  destinatarioCpfcnpj: {
    field: 'destinatario_cpfcnpj',
    type: DataTypes.STRING,
  },
  emitenteCpfcnpj: {
    field: 'emitente_cpfcnpj',
    type: DataTypes.STRING,
  },
  estadoDestinoId: {
    field: 'estado_destino_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estadoGeradorId: {
    field: 'estado_gerador_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  textoComplementar: {
    field: 'texto_complementar',
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  valor: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_nota',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Nota.hasOne(Pessoa, { foreignKey: 'cpfcnpj', sourceKey: 'destinatarioCpfcnpj', as: 'destinatario' });
Nota.hasOne(Pessoa, { foreignKey: 'cpfcnpj', sourceKey: 'emitenteCpfcnpj', as: 'emitente' });
Nota.hasMany(Produto, { foreignKey: 'notaChave', sourceKey: 'chave', as: 'produtos' });
