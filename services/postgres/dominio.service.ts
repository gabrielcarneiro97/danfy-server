import Dominio from './models/dominio.model';

export async function pegarDominioCodigo(codigo : string) {
  return Dominio.getBy({ codigo });
}

export async function adicionarEmpresa(codigo : string, numero : string, cnpj : string) {
  return new Dominio({
    codigo,
    numero,
    cnpj,
  }).save();
}
