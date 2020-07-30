import {
  Model, Optional, DataTypes,
} from 'sequelize';

import sequelize from '..';

interface MetaDadosAttrs {
  id : number
  ativo : boolean | null
  email : string | null
  dataHora : Date | null
  refMovimentoId : number | null
  refServicoId : number | null
  tipo : string | null
}

interface MetaDadosCreateAttrs extends Optional<MetaDadosAttrs, 'id'> {}

export default class MetaDados extends Model<MetaDadosAttrs, MetaDadosCreateAttrs> {
  public id!: number;
  public ativo!: boolean | null;
  public email!: string | null;
  public dataHora!: Date | null;
  public refMovimentoId!: number | null;
  public refServicoId!: number | null;
  public tipo!: string | null;
}

MetaDados.init({
  id: {
    field: 'md_id',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dataHora: {
    field: 'md_data_hora',
    type: DataTypes.DATE,
    allowNull: true,
  },
  refMovimentoId: {
    field: 'ref_movimento_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  refServicoId: {
    field: 'ref_servico_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'tb_meta_dados',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});
