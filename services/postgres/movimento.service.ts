import { pg } from '../pg.service';
import { mesInicioFim, Comp } from '../calculador.service';

import Movimento from './models/movimento.model';
import Imposto from './models/imposto.model';
import MetaDados from './models/metaDados.model';
import Icms from './models/icms.model';

import MovimentoPool from './pools/movimento.pool';
import ImpostoPool from './pools/imposto.pool';


export async function criarMovimento(movPool : MovimentoPool) {
  return movPool.save();
}

export async function pegarMovimentosPoolMes(donoCpfcnpj : string,
  competencia : Comp) : Promise<MovimentoPool[]> {
  const mes = mesInicioFim(competencia);

  const select = (str : string) => pg.select(str)
    .from('tb_movimento as mov')
    .where('mov.dono_cpfcnpj', donoCpfcnpj)
    .andWhere('md.ativo', true)
    .andWhere('mov.data_hora', '<=', mes.fim)
    .andWhere('mov.data_hora', '>=', mes.inicio);

  return new Promise((resolve, reject) => {
    const movPromise = select('mov.*').innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id');
    const mdPromise = select('md.*').innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id');
    const impPromise = select('imp.*')
      .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id')
      .innerJoin('tb_imposto as imp', 'mov.imposto_id', 'imp.id');
    const icmsPromise = select('icms.*')
      .innerJoin('tb_imposto as imp', 'mov.imposto_id', 'imp.id')
      .innerJoin('tb_icms as icms', 'imp.icms_id', 'icms.id')
      .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id');

    Promise.all([
      movPromise,
      mdPromise,
      impPromise,
      icmsPromise,
    ]).then(([movsPg, metaDadosPg, impostosPg, icmsPg]) => {
      const movimentosArr : Movimento[] = movsPg.map((o) => new Movimento(o, true));
      const metaDadosArr : MetaDados[] = metaDadosPg.map((o) => new MetaDados(o, true));
      const impostoArr : Imposto[] = impostosPg.map((o) => new Imposto(o, true));
      const icmsArr : Icms[] = icmsPg.map((o) => new Icms(o, true));

      const endArr = movimentosArr.map((movimento) => {
        const metaDados = metaDadosArr.find((o) => o.mdId === movimento.metaDadosId);
        const imposto = impostoArr.find((o) => o.id === movimento.impostoId);
        const icms = icmsArr.find((o) => o.id === imposto.icmsId);

        return new MovimentoPool(
          movimento,
          metaDados,
          new ImpostoPool(imposto, icms),
        );
      });

      resolve(endArr);
    }).catch(reject);
  });
}

export async function pegarMovimentoPoolId(id : number | string) {
  const [movimento] = await Movimento.getBy({ id });
  const [metaDados] = await MetaDados.getBy({ mdId: movimento.metaDadosId });
  const [imposto] = await Imposto.getBy({ id: movimento.impostoId });
  const [icms] = await Icms.getBy({ id: imposto.icmsId });

  return new MovimentoPool(movimento, metaDados, new ImpostoPool(imposto, icms));
}

export async function pegarMovimentoPoolNotaFinal(chaveNota : string) {
  const [mov] = await pg.select('mov.id')
    .from('tb_movimento as mov')
    .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id')
    .where('md.ativo', true)
    .andWhere('nota_final_chave', chaveNota);
  if (mov) return pegarMovimentoPoolId(mov.id);
  return null;
}

export async function pegarMovimentoPoolNotaInicial(chaveNota : string) {
  const [mov] = await pg.select('mov.id')
    .from('tb_movimento as mov')
    .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id')
    .where('md.ativo', true)
    .andWhere('nota_inicial_chave', chaveNota);
  if (mov) return pegarMovimentoPoolId(mov.id);
  return null;
}

export async function pegarMetaDados(movId : number | string) {
  const [movimento] = await Movimento.getBy({ id: movId });
  const [metaDados] = await MetaDados.getBy('md_id', movimento.metaDadosId.toString());

  return metaDados;
}

export function movimentoPoolFromObj(obj) {
  return new MovimentoPool(
    new Movimento(obj.movimento),
    new MetaDados(obj.metaDados),
    new ImpostoPool(
      new Imposto(obj.impostoPool.imposto),
      new Icms(obj.impostoPool.icms),
    ),
  );
}

export async function cancelarMovimento(id : number | string) {
  const metaDados = await pegarMetaDados(id);
  metaDados.ativo = false;
  return metaDados.save();
}
