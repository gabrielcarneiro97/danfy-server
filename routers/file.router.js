const { xml2js } = require('xml-js');
const {
  criarPessoa,
  criarNota,
  criarNotaServico,
} = require('../services/mongoose.service');
const {
  lerNfe,
  lerNfse,
} = require('../services/xml.service');

function root(req, res) {
  const { file } = req;
  const xml = file.buffer.toString('utf-8');
  const obj = xml2js(xml, { compact: true });

  let final = {};

  if (obj.CompNfse) {
    lerNfse(obj, (nota, emitente, destinatario) => {
      final = {
        tipo: 'nfse',
        pessoas: { [nota.emitente]: emitente, [nota.destinatario]: destinatario },
        nota,
      };

      const promises = [
        criarPessoa(nota.emitente, emitente),
        criarPessoa(nota.destinatario, destinatario),
        criarNotaServico(nota.chave, nota),
      ];

      Promise.all(promises).then(() => {
        res.send(final);
      }).catch((err) => {
        res.status(400).send({ ...final, err });
      });
    });
  } else if (obj.nfeProc) {
    lerNfe(obj, (nota, emitente, destinatario) => {
      final = {
        tipo: 'nfe',
        pessoas: { [nota.emitente]: emitente, [nota.destinatario]: destinatario },
        nota,
      };

      const promises = [
        criarPessoa(nota.emitente, emitente),
        criarPessoa(nota.destinatario, destinatario),
        criarNota(nota.chave, nota),
      ];

      Promise.all(promises).then(() => {
        res.send(final);
      }).catch((err) => {
        res.status(400).send({ ...final, err });
      });
    });
  } else {
    res.sendStatus(400);
  }
}

module.exports = {
  root,
};
