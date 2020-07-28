import {
  Model, Optional, DataTypes, HasOneGetAssociationMixin, Association,
} from 'sequelize';

import sequelize from '..';
import Estado from './Estado';

interface DifalAliquotaAttrs {
  id : number
  estadoId : number | null
  externo : number | null
  interno : number | null
}

interface DifalAliquotaCreateAttrs extends Optional<DifalAliquotaAttrs, 'id'> {}

export default class DifalAliquota extends Model<DifalAliquotaAttrs, DifalAliquotaCreateAttrs> {
  public id!: number;
  public estadoId!: number | null;
  public externo!: number | null;
  public interno!: number | null;

  public getEstado!: HasOneGetAssociationMixin<Estado>;

  public readonly estado?: Estado;

  public static associations: {
    estado: Association<DifalAliquota, Estado>;
  }
}

DifalAliquota.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  estadoId: {
    field: 'estado_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  externo: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  interno: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_difal_aliquota',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

DifalAliquota.hasOne(Estado, { foreignKey: 'id', sourceKey: 'estadoId', as: 'estado' });
