import {
  Model, Optional, DataTypes, Association, HasOneGetAssociationMixin, HasOneCreateAssociationMixin,
} from 'sequelize';

import sequelize from '..';
import Imposto from './Imposto';

interface TotalMovimentoAttrs {
  id : number
  impostoId : number | null
  lucro : number | null
  valorSaida : number | null
}

interface TotalMovimentoCreateAttrs extends Optional<TotalMovimentoAttrs, 'id'> {}

export default class TotalMovimento extends Model<TotalMovimentoAttrs, TotalMovimentoCreateAttrs> {
  public id!: number;
  public impostoId!: number | null;
  public lucro!: number | null;
  public valorSaida!: number | null;

  public getImposto!: HasOneGetAssociationMixin<Imposto>;
  public createImposto!: HasOneCreateAssociationMixin<Imposto>;

  public readonly imposto?: Imposto;

  static associations: {
    imposto: Association<TotalMovimento, Imposto>;
  }
}

TotalMovimento.init({
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
  lucro: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  valorSaida: {
    field: 'valor_saida',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_total_movimento',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

TotalMovimento.hasOne(Imposto, { foreignKey: 'id', sourceKey: 'impostoId', as: 'imposto' });
