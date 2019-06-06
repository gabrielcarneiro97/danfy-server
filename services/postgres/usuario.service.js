const { Usuario } = require('./models');

function criarUsuario(_id, usuarioParam) {
  const usuario = new Usuario({ _id, ...usuarioParam });

  return usuario.save();
}

function pegarUsuarioId(_id) {
  return Usuario.findById(_id);
}

module.exports = {
  criarUsuario,
  pegarUsuarioId,
};
