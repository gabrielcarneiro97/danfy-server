const { Usuario } = require('../../models');

function criarUsuario(_id, usuarioParam) {
  const usuario = new Usuario({ _id, ...usuarioParam });

  return usuario.save();
}

module.exports = {
  criarUsuario,
};
