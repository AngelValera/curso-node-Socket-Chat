class Usuarios {
	constructor() {
		this.personas = [];
	}

	agregarPersonas(id, nombre, sala) {
		const persona = {
			id,
			nombre,
			sala,
		};
		this.personas.push(persona);
		return this.personas;
	}

	getPersona(id) {
		const persona = this.personas.filter((persona) => persona.id === id)[0];
		return persona;
	}

	getPersonas() {
		return this.personas;
	}

	getPersonasPorSala(sala) {
		let personasSala = this.personas.filter((persona) => persona.sala === sala);
		return personasSala;
	}

	eliminarPersona(id) {
		const personaBorrada = this.getPersona(id);

		this.personas = this.personas.filter((persona) => persona.id != id);

		return personaBorrada;
	}
}

module.exports = {
	Usuarios,
};
