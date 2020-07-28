import {
  Model,
  Optional,
  Association,
  HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin,
  DataTypes,
} from 'sequelize';

import sequelize from '..';

import Acumulado from './Acumulado';
import Imposto from './Imposto';
import Retencao from './Retencao';

interface TotalSomaAttrs {
  id : number
  acumuladoId : number | null
  impostoId : number | null
  retencaoId : number | null
  valorMovimento : number | null
  valorServico : number | null

}

interface TotalSomaCreateAttrs extends Optional<
  TotalSomaAttrs,
  'id' | 'acumuladoId' | 'impostoId' | 'retencaoId'
> {}

export default class TotalSoma extends Model<TotalSomaAttrs, TotalSomaCreateAttrs> {
  public id!: number;
  public acumuladoId!: number | null;
  public impostoId!: number | null;
  public retencaoId!: number | null;
  public valorMovimento!: number | null;
  public valorServico!: number | null;

  public getAcumulado!: HasOneGetAssociationMixin<Acumulado>;
  public createAcumulado!: HasOneCreateAssociationMixin<Acumulado>;

  public readonly acumulado?: Acumulado;

  public getImposto!: HasOneGetAssociationMixin<Imposto>;
  public createImposto!: HasOneCreateAssociationMixin<Imposto>;

  public readonly imposto?: Imposto;

  public getRetencao!: HasOneGetAssociationMixin<Retencao>;
  public createRetencao!: HasOneCreateAssociationMixin<Retencao>;

  public readonly retencao?: Retencao;

  public static associations: {
    acumulado: Association<TotalSoma, Acumulado>;
    imposto: Association<TotalSoma, Imposto>;
    retencao: Association<TotalSoma, Retencao>;
  }
}

TotalSoma.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  acumuladoId: {
    field: 'acumulado_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  impostoId: {
    field: 'imposto_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  retencaoId: {
    field: 'retencao_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  valorMovimento: {
    field: 'valor_movimento',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  valorServico: {
    field: 'valor_servico',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_total_soma',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

TotalSoma.hasOne(Acumulado, { foreignKey: 'id', sourceKey: 'acumuladoId', as: 'acumulado' });
TotalSoma.hasOne(Imposto, { foreignKey: 'id', sourceKey: 'impostoId', as: 'imposto' });
TotalSoma.hasOne(Retencao, { foreignKey: 'id', sourceKey: 'retencaoId', as: 'retencao' });
