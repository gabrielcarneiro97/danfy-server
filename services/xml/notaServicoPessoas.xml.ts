import NotaServicoXml from './notaServico.xml'; // eslint-disable-line no-unused-vars
import PessoaXml from './pessoa.xml'; // eslint-disable-line no-unused-vars

export default class NotaServicoPessoas {
  notaServico : NotaServicoXml;
  emitente : PessoaXml;
  destinatario : PessoaXml;
}
