import {
  Model, Optional, DataTypes, Association, HasOneGetAssociationMixin, HasOneCreateAssociationMixin,
} from 'sequelize';

import sequelize from '..';
import Imposto from './Imposto';
import Retencao from './Retencao';

interface TotalServicoAttrs {
  id : number
  impostoId : number | null
  retencaoId : number | null
  total : number | null
}

interface TotalServicoCreateAttrs extends Optional<TotalServicoAttrs, 'id'> {}

export default class TotalServico extends Model<TotalServicoAttrs, TotalServicoCreateAttrs> {
  public id!: number;
  public impostoId!: number | null;
  public retencaoId!: number | null;
  public total!: number | null;

  public getImposto!: HasOneGetAssociationMixin<Imposto>;
  public createImposto!: HasOneCreateAssociationMixin<Imposto>;

  public readonly imposto?: Imposto;

  public getRetencao!: HasOneGetAssociationMixin<Retencao>;
  public createRetencao!: HasOneCreateAssociationMixin<Retencao>;

  public readonly retencao?: Retencao;

  static associations: {
    imposto: Association<TotalServico, Imposto>;
    retencao: Association<TotalServico, Retencao>;
  }
}

TotalServico.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  total: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_total_servico',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

TotalServico.hasOne(Imposto, { foreignKey: 'id', sourceKey: 'impostoId', as: 'imposto' });
TotalServico.hasOne(Retencao, { foreignKey: 'id', sourceKey: 'retencaoId', as: 'retencao' });
