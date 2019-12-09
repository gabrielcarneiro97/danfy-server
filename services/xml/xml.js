const { xml2js } = require('xml-js');

function xmlToObj(file) {
  const xml = file.buffer.toString('utf-8');
  return xml2js(xml, { compact: true });
}

module.exports = { xmlToObj };
