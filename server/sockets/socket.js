const { io } = require("../server");
const { Usuarios } = require("../classes/usuarios");
const { crearMensaje } = require("../utilidades/utilidades");

const usuarios = new Usuarios();

io.on("connection", (client) => {
	client.on("entraChat", (data, callback) => {
		let haveGo = false;
		let mensaje = "";
		// Comprobamos que se nos envíen el nombre y la sala
		if (!data.nombre && !data.sala) {
			mensaje = "El nombre y la sala son necesarios";
		} else if (!data.nombre) {
			mensaje = "El nombre es necesario";
		} else if (!data.sala) {
			mensaje = "La sala es necesaria";
		} else {
			haveGo = true;
		}

		// Si todo es correcto agregamos el usuario a la sala
		if (haveGo) {
			const persona = usuarios.agregarPersonas(
				client.id,
				data.nombre,
				data.sala,
			);
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
			callback({
				error: false,
				result: usuarios.getPersonasPorSala(data.sala),
			});
		} else {
			// si falta algún parámetro enviamos un mensaje de error
			callback({
				error: true,
				result: mensaje,
			});
		}
	});

	client.on("disconnect", () => {
		const personaBorrada = usuarios.eliminarPersona(client.id);
		if (personaBorrada) {
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
		}
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
