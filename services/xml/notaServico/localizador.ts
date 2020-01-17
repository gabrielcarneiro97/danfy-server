import {
  ElementCompact,
} from 'xml-js';

import cidades from './cidades';

import NotaServicoPessoas from '../notaServicoPessoas.xml';

const isBeloHorizonte = (obj : ElementCompact) : boolean => (
  !!obj && !!obj.CompNfse && !!obj.CompNfse.Nfse && !!obj.CompNfse.Nfse.InfNfse
);

const isContagem = (obj : ElementCompact) : boolean => !!obj['ns2:NFSE'];

const isGovDigital = (obj : ElementCompact) : boolean => !!obj.GovDigital;

function qualCidade(obj : ElementCompact) : (obj : ElementCompact) => NotaServicoPessoas[] {
  if (isBeloHorizonte(obj)) return cidades.beloHorizonte;
  if (isContagem(obj)) return cidades.contagem;
  if (isGovDigital(obj)) return cidades.govDivital;

  return () => [null];
}

export default {
  qualCidade,
};
