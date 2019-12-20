import {
  xml2js,
  ElementCompact, // eslint-disable-line no-unused-vars
} from 'xml-js';

export function xmlToObj(file : string | { buffer : Buffer }) : ElementCompact {
  if (typeof file === 'string') return xml2js(file, { compact: true });
  const xml = file.buffer.toString('utf-8');
  return xml2js(xml, { compact: true });
}

export const a = {};

export default { xmlToObj };
