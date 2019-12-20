import Servico from '../../postgres/models/servico.model';
import MetaDados from '../../postgres/models/metaDados.model';
import Imposto from '../../postgres/models/imposto.model';
import Retencao from '../../postgres/models/retencao.model';
import NotaServico from '../../postgres/models/notaServico.model'; // eslint-disable-line no-unused-vars
import Aliquota from '../../postgres/models/aliquota.model'; // eslint-disable-line no-unused-vars

import ServicoPool from '../../postgres/pools/servico.pool';


async function calcularServicoPool(notaServico : NotaServico, aliquota : Aliquota) {
  const {
    emitenteCpfcnpj,
    status,
    dataHora,
    valor,
  } = notaServico;

  const servico = new Servico(null);

  servico.donoCpfcnpj = emitenteCpfcnpj;
  servico.notaChave = notaServico.chave;
  servico.dataHora = dataHora;
  servico.valor = 0;
  servico.conferido = true;

  if (status === 'CANCELADA') {
    return new ServicoPool(servico, new MetaDados(null), new Imposto(null), new Retencao(null));
  }

  servico.valor = valor;

  const servicoPool = new ServicoPool(
    servico,
    new MetaDados(null),
    new Imposto(null),
    new Retencao(null),
  );

  aliquota.irpj = 0.048; // eslint-disable-line
  aliquota.csll = 0.0288; // eslint-disable-line

  const impostoLista = ['iss', 'pis', 'cofins', 'irpj', 'csll'];
  const { imposto } = servicoPool;
  impostoLista.forEach((impostoNome) => {
    const val = aliquota[impostoNome] * notaServico.valor;
    imposto[impostoNome] = val;
    imposto.total += val;
  });

  imposto.iss = notaServico.iss || imposto.iss;

  const [retencao] = await Retencao.getBy({ id: notaServico.retencaoId });
  servicoPool.retencao = retencao;

  return servicoPool;
}

export default {
  calcularServicoPool,
};
