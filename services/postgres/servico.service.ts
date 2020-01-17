import ServicoPool from './pools/servico.pool';

import Servico from './models/servico.model';
import MetaDados from './models/metaDados.model';
import Imposto from './models/imposto.model';
import Retencao from './models/retencao.model';

import { pg } from '../pg.service';
import {
  mesInicioFim,
  Comp,
} from '../calculador.service';

export async function criarServico(servicoPool : ServicoPool) {
  return servicoPool.save();
}

export async function criarServicos(servicosPool : ServicoPool[]) {
  const promises = servicosPool.map((servicoPool) => servicoPool.save());
  await Promise.all(promises);
  return true;
}

export async function pegarServicosPoolMes(donoCpfcnpj : string,
  competencia : Comp) : Promise<ServicoPool[]> {
  const mes = mesInicioFim(competencia);

  const select = (str) => pg.select(str).from('tb_servico as serv')
    .where('serv.dono_cpfcnpj', donoCpfcnpj)
    .andWhere('serv.data_hora', '<=', mes.fim)
    .andWhere('serv.data_hora', '>=', mes.inicio);

  const [
    servsPg,
    impsPg,
    retsPg,
    metaDadosPg,
  ] = await Promise.all([
    select('serv.*'),
    select('imp.*').innerJoin('tb_imposto as imp', 'serv.imposto_id', 'imp.id'),
    select('ret.*').innerJoin('tb_retencao as ret', 'serv.retencao_id', 'ret.id'),
    select('md.*').innerJoin('tb_meta_dados as md', 'serv.meta_dados_id', 'md.md_id'),
  ]);

  const servsArr = servsPg.map((o) => new Servico(o, true));
  const impsArr = impsPg.map((o) => new Imposto(o, true));
  const retsArr = retsPg.map((o) => new Retencao(o, true));
  const metaDadosArr = metaDadosPg.map((o) => new MetaDados(o, true));

  const finalArr : ServicoPool[] = servsArr.map((servico) => {
    const metaDados = servico.metaDadosId
      ? metaDadosArr.find((o) => o.mdId === servico.metaDadosId) : undefined;
    const imposto = impsArr.find((o) => o.id === servico.impostoId);
    const retencao = retsArr.find((o) => o.id === servico.retencaoId);

    return new ServicoPool(servico, metaDados, imposto, retencao);
  });

  return finalArr;
}

export async function pegarServicoPoolId(id : string) {
  const [servico] = await Servico.getBy({ id });
  const [metaDados] = await MetaDados.getBy({ mdId: servico.metaDadosId });
  const [imposto] = await Imposto.getBy({ id: servico.impostoId });
  const [retencao] = await Retencao.getBy({ id: servico.retencaoId });

  return new ServicoPool(servico, metaDados, imposto, retencao);
}

export async function pegarServicoPoolNota(notaChave : string) {
  const [servico] = await Servico.getBy({ notaChave });
  const [metaDados] = await MetaDados.getBy({ mdId: servico.metaDadosId });
  const [imposto] = await Imposto.getBy({ id: servico.impostoId });
  const [retencao] = await Retencao.getBy({ id: servico.retencaoId });

  return new ServicoPool(servico, metaDados, imposto, retencao);
}

export async function excluirServico(servicoId : string) {
  const servicoPool = await pegarServicoPoolId(servicoId);
  return servicoPool.del();
}

export function servicoPoolFromObj(obj : { servico : object; metaDados : object;
  imposto : object; retencao : object; }) {
  return new ServicoPool(
    new Servico(obj.servico),
    new MetaDados(obj.metaDados),
    new Imposto(obj.imposto),
    new Retencao(obj.retencao),
  );
}
