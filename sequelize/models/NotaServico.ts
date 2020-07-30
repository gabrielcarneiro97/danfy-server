import {
  Model,
  HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin,
  HasOneSetAssociationMixin,
  Association,
  DataTypes,
} from 'sequelize';

import sequelize from '..';

import Pessoa from './Pessoa';
import Retencao from './Retencao';

interface NotaServicoAttrs {
  chave : string
  dataHora : Date
  descricao : string | null
  destinatarioCpfcnpj : string
  emitenteCpfcnpj : string
  iss : number | null
  numero : string
  retencaoId : number | null
  status : string
  valor : number | null
}

export default class NotaServico extends Model<NotaServicoAttrs> {
  public chave!: string;
  public dataHora!: Date;
  public descricao!: string | null;
  public destinatarioCpfcnpj!: string;
  public emitenteCpfcnpj!: string;
  public iss!: number | null;
  public numero!: string;
  public retencaoId!: number | null;
  public status!: string;
  public valor!: number | null;

  public getDestinatario!: HasOneGetAssociationMixin<Pessoa>;
  public createDestinatario!: HasOneCreateAssociationMixin<Pessoa>;
  public setDestinatario!: HasOneSetAssociationMixin<Pessoa, string>;

  public readonly destinatario?: Pessoa;

  public getEmitente!: HasOneGetAssociationMixin<Pessoa>;
  public createEmitente!: HasOneCreateAssociationMixin<Pessoa>;
  public setEmitente!: HasOneSetAssociationMixin<Pessoa, string>;

  public readonly emitente?: Pessoa;

  public getRetencao!: HasOneGetAssociationMixin<Retencao>;
  public createRetencao!: HasOneCreateAssociationMixin<Retencao>;
  public setRerencao!: HasOneSetAssociationMixin<Retencao, number>;

  public readonly retencao?: Retencao;

  public static associations: {
    destinatario: Association<NotaServico, Pessoa>;
    emitente: Association<NotaServico, Pessoa>;
    retencao: Association<NotaServico, Retencao>;
  }
}

NotaServico.init({
  chave: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  dataHora: {
    field: 'data_hora',
    type: DataTypes.DATE,
  },
  descricao: {
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
  iss: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  numero: DataTypes.STRING,
  retencaoId: {
    field: 'retencao_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: DataTypes.STRING,
  valor: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_nota_servico',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

NotaServico.hasOne(Pessoa, { foreignKey: 'cpfcnpj', sourceKey: 'destinatarioCpfcnpj', as: 'destinatario' });
NotaServico.hasOne(Pessoa, { foreignKey: 'cpfcnpj', sourceKey: 'emitenteCpfcnpj', as: 'emitente' });
NotaServico.hasOne(Retencao, { foreignKey: 'id', sourceKey: 'retencaoId', as: 'retencao' });
