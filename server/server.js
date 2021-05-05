const express = require("express");
const socketIO = require("socket.io");
const morgan = require("morgan");
const chalk = require("chalk");
const http = require("http");

const path = require("path");
// Probando Chalk
const error = chalk.bold.red;
const warning = chalk.keyword("orange");
const info = chalk.bold.blueBright;

const app = express();
let server = http.createServer(app);

const publicPath = path.resolve(__dirname, "../public");
const port = process.env.PORT || 3000;

app.use(morgan("tiny"));
app.use(express.static(publicPath));

// IO = esta es la comunicacion del backend
module.exports.io = socketIO(server);
require("./sockets/socket");

server.listen(port, (err) => {
	if (err) throw new Error(err);

	console.log(info(`Servidor corriendo en puerto ${port}`));
});
