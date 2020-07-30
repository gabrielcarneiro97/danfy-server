import { Model, DataTypes, Optional } from 'sequelize';

import sequelize from '..';

interface SimplesAttrs {
  id : number
  dataHora : Date | null
  donoCpfcnpj : string
  totalDoze : number | null
  totalExercicio : number | null
  totalMes : number | null
  totalMovimentos : number | null
  totalNaoRedito : number | null
  totalRetido : number | null
  totalServicos : number | null
}

interface SimplesCreateAttrs extends Optional<SimplesAttrs, 'id'> {}

export default class Simples extends Model<SimplesAttrs, SimplesCreateAttrs> {
  public id!: number;
  public dataHora!: Date | null;
  public donoCpfcnpj!: string;
  public totalDoze!: number | null;
  public totalExercicio!: number | null;
  public totalMes!: number | null;
  public totalMovimentos!: number | null;
  public totalNaoRedito!: number | null;
  public totalRetido!: number | null;
  public totalServicos!: number | null;
}

Simples.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dataHora: {
    field: 'data_hora',
    type: DataTypes.DATE,
    allowNull: true,
  },
  donoCpfcnpj: {
    field: 'dono_cpfcnpj',
    type: DataTypes.STRING,
  },
  totalDoze: {
    field: 'total_doze',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalExercicio: {
    field: 'total_exercicio',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalMes: {
    field: 'total_mes',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalMovimentos: {
    field: 'total_movimentos',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalNaoRedito: {
    field: 'total_nao_retido',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalRetido: {
    field: 'total_retido',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalServicos: {
    field: 'total_servicos',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_simples',
  schema: 'danfy',
  sequelize,
  timestamps: true,
});
