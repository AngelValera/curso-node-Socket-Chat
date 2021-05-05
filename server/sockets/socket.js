const { io } = require("../server");
const { Usuarios } = require("../classes/usuarios");
const { crearMensaje } = require("../utilidades/utilidades");

const usuarios = new Usuarios();

io.on("connection", (client) => {
	client.on("entraChat", (data, callback) => {
		if (!data.nombre) {
			callback({
				error: true,
				mensaje: "El nombre es necesario",
			});
		}
		if (!data.sala) {
			callback({
				error: true,
				mensaje: "La sala es necesaria",
			});
		}

		const persona = usuarios.agregarPersonas(client.id, data.nombre, data.sala);
		client.join(data.sala);

		client.broadcast
			.to(data.sala)
			.emit("listaPersona", usuarios.getPersonasPorSala(data.sala));
		client.broadcast
			.to(data.sala)
			.emit(
				"crearMensaje",
				crearMensaje("Administrador", `${data.nombre} entró en el chat`),
			);

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

	client.on("crearMensaje", (data, callback) => {
		let persona = usuarios.getPersona(client.id);

		let mensaje = crearMensaje(persona.nombre, data.mensaje);
		client.broadcast.to(persona.sala).emit("crearMensaje", mensaje);
		callback(mensaje);
	});

	// Mensajes Privados
	client.on("mensajePrivado", (data) => {
		let persona = usuarios.getPersona(client.id);
		client.broadcast
			.to(data.para)
			.emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje));
	});
});
