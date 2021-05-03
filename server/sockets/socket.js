const { io } = require("../server");
const { Usuarios } = require("../classes/usuarios");
const { crearMensaje } = require("../utilidades/utilidades");

const usuarios = new Usuarios();

io.on("connection", (client) => {
	client.on("entraChat", (data, callback) => {
		if (!data.nombre || !data.sala) {
			callback({
				error: true,
				mensaje: "El nombre/sala es necesario",
			});
		}
		const personas = usuarios.agregarPersonas(
			client.id,
			data.nombre,
			data.sala,
		);

		client.join(data.sala);

		client.broadcast
			.to(data.sala)
			.emit("listaPersona", usuarios.getPersonasPorSala(data.sala));

		callback(usuarios.getPersonasPorSala(data.sala));
	});

	client.on("disconnect", () => {
		const personaBorrada = usuarios.eliminarPersona(client.id);

		client.broadcast
			.to(personaBorrada.sala)
			.emit(
				"crearMensaje",
				crearMensaje(
					"Administrador",
					`${personaBorrada.nombre} abandonó el chat`,
				),
			);
		client.broadcast
			.to(personaBorrada.sala)
			.emit("listaPersona", usuarios.getPersonasPorSala(personaBorrada.sala));
	});

	client.on("crearMensaje", (data) => {
		let persona = usuarios.getPersona(client.id);

		let mensaje = crearMensaje(persona.nombre, data.mensaje);
		client.broadcast.emit("crearMensaje", mensaje);
	});

	// Mensajes Privados
	client.on("mensajePrivado", (data) => {
		let persona = usuarios.getPersona(client.id);
		client.broadcast
			.to(data.para)
			.emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje));
	});
});
