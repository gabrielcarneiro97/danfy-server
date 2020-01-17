import NotaServicoXml from './notaServico.xml';
import PessoaXml from './pessoa.xml';

export default class NotaServicoPessoas {
  notaServico : NotaServicoXml;
  emitente : PessoaXml;
  destinatario : PessoaXml;
}
