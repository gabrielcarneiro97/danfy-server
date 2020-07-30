import {
  Model,
  DataTypes,
  Optional,
  HasOneGetAssociationMixin,
  Association,
  HasOneCreateAssociationMixin,
  HasOneSetAssociationMixin,
} from 'sequelize';

import sequelize from '..';
import Pessoa from './Pessoa';
import Nota from './Nota';
import MetaDados from './MetaDados';

interface MovimentoAttrs {
  id : number
  conferido : boolean | null
  dataHora : Date
  donoCpfcnpj : string
  impostoId : number | null
  lucro : number | null
  metaDadosId : number | null
  notaFinalChave : string
  notaInicialChave : string | null
  valorSaida : number | null
}

interface MovimentoCreateAttrs extends Optional<MovimentoAttrs, 'id'> {}

export default class Movimento extends Model<MovimentoAttrs, MovimentoCreateAttrs> {
  public id!: number;
  public conferido!: boolean | null;
  public dataHora!: Date;
  public donoCpfcnpj!: string;
  public impostoId!: number | null;
  public lucro!: number | null;
  public metaDadosId!: number | null;
  public notaFinalChave!: string;
  public notaInicialChave!: string | null;
  public valorSaida!: number | null;

  public getDono!: HasOneGetAssociationMixin<Pessoa>;

  public readonly dono?: Pessoa;

  public getNotaFinal!: HasOneGetAssociationMixin<Nota>;

  public readonly notaFinal?: Nota;

  public getNotaInicial!: HasOneGetAssociationMixin<Nota>;

  public readonly notaInicial?: Nota;

  public getMetaDados!: HasOneGetAssociationMixin<MetaDados>;
  public createMetaDados!: HasOneCreateAssociationMixin<MetaDados>;
  public setMetaDados!: HasOneSetAssociationMixin<MetaDados, number>;

  public static associations: {
    dono: Association<Movimento, Pessoa>;
    notaFinal: Association<Movimento, Nota>;
    notaInicial: Association<Movimento, Nota>;
    metaDados: Association<Movimento, MetaDados>;
  }
}

Movimento.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conferido: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  dataHora: {
    field: 'data_hora',
    type: DataTypes.DATE,
  },
  donoCpfcnpj: {
    field: 'dono_cpfcnpj',
    type: DataTypes.STRING,
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
  metaDadosId: {
    field: 'meta_dados_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notaFinalChave: {
    field: 'nota_final_chave',
    type: DataTypes.STRING,
  },
  notaInicialChave: {
    field: 'nota_inicial_chave',
    type: DataTypes.STRING,
    allowNull: true,
  },
  valorSaida: {
    field: 'valor_saida',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_movimento',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Movimento.hasOne(Pessoa, { foreignKey: 'cpfcnpj', sourceKey: 'donoCpfcnpj', as: 'dono' });
Movimento.hasOne(Nota, { foreignKey: 'chave', sourceKey: 'notaFinalChave', as: 'notaFinal' });
Movimento.hasOne(Nota, { foreignKey: 'chave', sourceKey: 'notaInicialChave', as: 'notaInicial' });
Movimento.hasOne(MetaDados, { foreignKey: 'id', sourceKey: 'metaDadosId', as: 'metaDados' });
