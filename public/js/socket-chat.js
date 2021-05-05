var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.has("nombre")) {
	window.location = "index.html";
	throw new Error("El nombre es necesario");
}
if (!params.has("sala")) {
	window.location = "index.html";
	throw new Error("La sala es necesaria");
}

var usuario = {
	nombre: params.get("nombre"),
	sala: params.get("sala"),
};

socket.on("connect", function () {
	console.log("Conectado al servidor");

	socket.emit("entraChat", usuario, (resp) => {
		if (!resp.error) {
			renderizarUsuarios(resp.result);
		} else {
			console.log(resp.result);
		}
	});
});

// escuchar
socket.on("disconnect", function () {
	console.log("Perdimos conexión con el servidor");
});

// Escuchar información
socket.on("crearMensaje", function (mensaje) {
	//console.log("Servidor:", mensaje);
	renderizarMensaje(mensaje, false);
	scrollBottom();
});

//Escuchar cambios de usuarios
socket.on("listaPersona", function (personas) {
	//console.log(personas);
	renderizarUsuarios(personas);
});

// Mensajes Privados
socket.on("mensajesPrivado", (mensaje) => {
	console.log(mensaje);
});
