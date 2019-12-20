import {
  ElementCompact, // eslint-disable-line no-unused-vars
} from 'xml-js';

import cidades from './cidades';

import NotaServicoPessoas from '../notaServicoPessoas.xml'; // eslint-disable-line no-unused-vars

const isBeloHorizonte = (obj : ElementCompact) : boolean => (
  !!obj && !!obj.CompNfse && !!obj.CompNfse.Nfse && !!obj.CompNfse.Nfse.InfNfse
);

const isContagem = (obj : ElementCompact) : boolean => !!obj['ns2:NFSE'];

function qualCidade(obj : ElementCompact) : (obj : ElementCompact) => NotaServicoPessoas[] {
  if (isBeloHorizonte(obj)) return cidades.beloHorizonte;
  if (isContagem(obj)) return cidades.contagem;

  return () => [null];
}

export default {
  qualCidade,
};
