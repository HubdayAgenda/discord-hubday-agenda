const Discord = require("discord.js");
const Utils = require("./utils");

class Devoir {
	/*
		-> module : string
		-> labels : string[] -> minimum 1
		-> date : new Date().toISOString()
		-> group : string "" -> groupe entier | "prime | "seconde" -> groupe de l'utilisateur

		-> delivery : string (intitulé du lien)
		-> link : string (lien Moodle, consignes) -> optionnel
		-> notation : boolean
		-> courseId : string -> proposer de lier a un cours si la date correspond a un cours
	*/

	constructor(modul_, labels, date, group, delivery, link, notation, courseId) {
		this.module = modul_;
		this.labels = labels;
		this.date = date;
		this.group = group;
		this.delivery = delivery;
		this.link = link;
		this.notation = notation;
		this.courseId = courseId;
	}

	getEmbed() {
		const embed = new Discord.MessageEmbed()
			.setColor("#afdab9")
			.setTitle(this.module.name + ((this.delivery !== null) ? ("  -  " + this.delivery) : ""))
			.setURL(this.link !== null ? this.link : "https://moodle1.u-bordeaux.fr/my/")
			.setAuthor("Agenda Hubday" + (this.notation !== null ? (this.notation ? " - Devoir noté" : " - Devoir non noté") : ""), "https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png", "https://www.hubday.fr/dashboard")
			.setFooter("À rendre pour le : " + Utils.convertIsoToDate(this.date));

		let numTache = 1;
		this.labels.forEach(element => {
			embed.addField("Tâche " + ((this.labels.length > 1) ? numTache : ""), "```" + element + "```", true);
			numTache++;
		});

		return embed;
	}


	// async persist() {
	// 	if (this.id === undefined) { // Nouveau devoir

	// 	} else { // Devoir existant : mise à jour

	// 	}
	// }
}

module.exports = Devoir;
