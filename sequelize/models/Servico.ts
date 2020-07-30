import {
  Model,
  DataTypes,
  Optional,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasOneCreateAssociationMixin,
  Association,
} from 'sequelize';

import sequelize from '..';
import Pessoa from './Pessoa';
import Grupo from './Grupo';
import Imposto from './Imposto';
import NotaServico from './NotaServico';
import Retencao from './Retencao';
import MetaDados from './MetaDados';

interface ServicoAttrs {
  id : number
  conferido : boolean | null
  dataHora : Date | null
  donoCpfcnpj : string | null
  grupoId : number | null
  impostoId : number | null
  metaDadosId : number | null
  notaChave : string | null
  retencaoId : number | null
  valor : number | null
}

interface ServicoCreateAttrs extends Optional<ServicoAttrs, 'id'> {}

export default class Servico extends Model<ServicoAttrs, ServicoCreateAttrs> {
  public id!: number;
  public conferido!: boolean | null;
  public dataHora!: Date | null;
  public donoCpfcnpj!: string | null;
  public grupoId!: number | null;
  public impostoId!: number | null;
  public metaDadosId!: number | null;
  public notaChave!: string | null;
  public retencaoId!: number | null;
  public valor!: number | null;

  public getDono!: HasOneGetAssociationMixin<Pessoa>;

  public readonly dono?: Pessoa;

  public getGrupo!: HasOneGetAssociationMixin<Grupo>;
  public setGrupo!: HasOneSetAssociationMixin<Grupo, number>;

  public readonly grupo?: Grupo;

  public getImposto!: HasOneGetAssociationMixin<Imposto>;
  public createImposto!: HasOneCreateAssociationMixin<Imposto>;
  public setImposto!: HasOneSetAssociationMixin<Imposto, number>;

  public readonly imposto?: Imposto;

  public getNotaServico!: HasOneGetAssociationMixin<NotaServico>;
  public setNotaServico!: HasOneSetAssociationMixin<NotaServico, string>;

  public readonly notaServico?: NotaServico;

  public getRetencao!: HasOneGetAssociationMixin<Retencao>;
  public createRetencao!: HasOneCreateAssociationMixin<Retencao>;
  public setRetencao!: HasOneSetAssociationMixin<Retencao, number>;

  public readonly retencao?: Retencao;

  public getMetaDados!: HasOneGetAssociationMixin<MetaDados>;
  public createMetaDados!: HasOneCreateAssociationMixin<MetaDados>;
  public setMetaDados!: HasOneSetAssociationMixin<MetaDados, number>;

  public readonly metaDados?: MetaDados;

  public static associations: {
    dono: Association<Servico, Pessoa>;
    grupo: Association<Servico, Grupo>;
    imposto: Association<Servico, Imposto>;
    notaServico: Association<Servico, NotaServico>;
    retencao: Association<Servico, Retencao>;
    MetaDados: Association<Servico, MetaDados>;
  }
}

Servico.init({
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
    allowNull: true,
  },
  donoCpfcnpj: {
    field: 'dono_cpfcnpj',
    type: DataTypes.STRING,
    allowNull: true,
  },
  grupoId: {
    field: 'grupo_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  impostoId: {
    field: 'imposto_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  metaDadosId: {
    field: 'meta_dados_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notaChave: {
    field: 'nota_chave',
    type: DataTypes.STRING,
    allowNull: true,
  },
  retencaoId: {
    field: 'retencao_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  valor: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'tb_servico',
  schema: 'danfy',
  sequelize,
  timestamps: false,
});

Servico.hasOne(Pessoa, { foreignKey: 'cpfcnpj', sourceKey: 'donoCpfcnpj', as: 'dono' });
Servico.hasOne(Grupo, { foreignKey: 'id', sourceKey: 'grupoId', as: 'grupo' });
Servico.hasOne(Imposto, { foreignKey: 'id', sourceKey: 'impostoId', as: 'imposto' });
Servico.hasOne(NotaServico, { foreignKey: 'chave', sourceKey: 'notaChave', as: 'notaServico' });
Servico.hasOne(Retencao, { foreignKey: 'id', sourceKey: 'retencaoId', as: 'retencao' });
Servico.hasOne(MetaDados, { foreignKey: 'id', sourceKey: 'metaDadosId', as: 'metaDados' });
