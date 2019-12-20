export type Pais = {
  nome : string;
  codigo : string;
}

export type Municipio = {
  codigo : string;
  nome? : string;
}

export default class EnderecoXml {
  logradouro : string;
  numero : string;
  complemento : string;
  bairro : string;
  municipio : Municipio;
  estado : string;
  pais : Pais;

  cep : string;
}
