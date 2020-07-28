import {
  Model, Optional, DataTypes, Association, HasOneGetAssociationMixin, HasOneCreateAssociationMixin,
} from 'sequelize';

import sequelize from '..';
import Pessoa from './Pessoa';
import TotalMovimento from './TotalMovimento';
import TotalServico from './TotalServico';
import TotalSoma from './TotalSoma';

interface TotalAttrs {
  id : number
  anual : boolean | null
  dataHora : Date | null
  donoCpfcnpj : string | null
  totalMovimentoId : number | null
  totalServicoId : number | null
  totalSomaId : number | null
  trimestral : boolean | null
}

interface TotalCreateAttrs extends Optional<TotalAttrs, 'id'> {}

export default class Total extends Model<TotalAttrs, TotalCreateAttrs> {
  public id!: number;
  public anual!: boolean | null;
  public dataHora!: Date | null;
  public donoCpfcnpj!: string | null;
  public totalMovimentoId!: number | null;
  public totalServicoId!: number | null;
  public totalSomaId!: number | null;
  public trimestral!: boolean | null;

  public getDono!: HasOneGetAssociationMixin<Pessoa>;

  public readonly dono?: Pessoa;

  public getTotalMovimento!: HasOneGetAssociationMixin<TotalMovimento>;
  public createTotalMovimento!: HasOneCreateAssociationMixin<TotalMovimento>;

  public readonly totalMovimento?: TotalMovimento;

  public getTotalServico!: HasOneGetAssociationMixin<TotalServico>;
  public createTotalServico!: HasOneCreateAssociationMixin<TotalServico>;

  public readonly totalServico?: TotalServico;

  public getTotalSoma!: HasOneGetAssociationMixin<TotalSoma>;
  public createTotalSoma!: HasOneCreateAssociationMixin<TotalSoma>;

  public readonly totalSoma?: TotalSoma;

  public static associations: {
    dono: Association<Total, Pessoa>;
    totalMovimento: Association<Total, TotalMovimento>;
    totalServico: Association<Total, TotalServico>;
    totalSoma: Association<Total, TotalSoma>;
  }
}

Total.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  anual: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  dataHora: {
    field: 'data_hora',
    type: DataTypes.DATE,
    allowNull: true,
  },
  donoCpfcnpj: {
    field: 'dono_cpfcnpj',
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalMovimentoId: {
    field: 'total_movimento_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalServicoId: {
    field: 'total_servico_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalSomaId: {
    field: 'total_soma_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  trimestral: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
}, {
  tableName: 'tb_total',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Total.hasOne(Pessoa, { foreignKey: 'cpfcnpj', sourceKey: 'donoCpfcnpj', as: 'dono' });
Total.hasOne(TotalMovimento, { foreignKey: 'id', sourceKey: 'totalMovimentoId', as: 'totalMovimento' });
Total.hasOne(TotalServico, { foreignKey: 'id', sourceKey: 'totalServicoId', as: 'totalServico' });
Total.hasOne(TotalSoma, { foreignKey: 'id', sourceKey: 'totalSomaId', as: 'totalSoma' });
