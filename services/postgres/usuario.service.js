const { Usuario } = require('./models');

function criarUsuario(usuarioParam) {
  const usuario = new Usuario({ usuarioParam });

  return usuario.save();
}

function pegarUsuarioId(id) {
  return Usuario.getBy('id', id);
}

module.exports = {
  criarUsuario,
  pegarUsuarioId,
};
