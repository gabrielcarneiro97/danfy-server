import Usuario from './models/usuario.model';

export async function criarUsuario(usuarioParam : object) {
  const usuario = new Usuario({ ...usuarioParam });

  return usuario.save();
}

export async function pegarUsuarioId(id : string) {
  return (await Usuario.getBy('id', id))[0];
}
