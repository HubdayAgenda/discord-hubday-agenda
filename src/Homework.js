const Discord = require("discord.js");
// const Utils = require("./utils");

class Homework {
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

	/*
		module -> subject : string (id de la matière correspondante)
		labels -> tasks : string[] (liste de tâches d'un devoir, minimum 1 entrée)
		date : string (date du devoir, au format AAAA-MM-JJ)
		+ deadline : string (heure de remise, au format HH:MM:SS, nullable)
		group : string (groupe concerné par le devoir, nullable) > :
			- null : groupe TD
			- "prime" : groupe TP
			- "seconde" : groupe TP
			- "idOption" : groupe d'option (android, vr, roboticS2...)
		delivery -> details : string (détail, nom du lien, intitulé de la remise, nullable)
		link : string (lien Moodle, consignes..., nullable)
		notation : boolean (nullable) > :
			- null : notation non connue/non renseignée
			- true : devoir noté
			- false: devoir non noté
		courseId -> lessonId : string (id du cours associé, lié automatiquement si la date correspond, nullable, )
		+ notes : string (texte multiligne, nullable)
*/

	constructor(subject, tasks, date, /*deadline,*/ group, details, link, notation, lessonId) {
		this.id = null;
		this.subject = subject;
		this.tasks = tasks;
		this.date = date;
		//this.deadline = deadline;
		this.group = group;
		this.details = details;
		this.link = link;
		this.notation = notation;
		this.lessonId = lessonId;
	}

	/**
	 * Créer un embed a partir de ce devoir avec toutes ses informations
	 */
	getEmbed() {
		const embed = new Discord.MessageEmbed()
			.setColor(this.subject.color)
			.setTitle(`${this.subject.displayId} - ${this.subject.displayName}`)
			.setURL("https://www.hubday.fr/dashboard#subject/" + this.subject.id)
			.setAuthor("Devoir enregistré avec succès ! [Voir]", "https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png", "https://www.hubday.fr/dashboard#homework/" + this.id + "/view")
			.setFooter("Échéance", "https://images.emojiterra.com/google/android-nougat/512px/23f1.png")
			.setTimestamp(new Date(this.date));

		let description = "";

		if (this.details !== null) {
			if (this.details !== null) description += (`[${this.details}](${this.link})\n`);
			else description += this.details + "\n";
		}

		this.tasks.forEach(element => {
			description += `\n🔳 ${element}\n`;
		});

		description += (this.notation !== null ? (this.notation ? "\n📈 Devoir noté\n" : "\n📉 Devoir non noté\n") : "");

		description += "‌‌ ";

		embed.setDescription(description);

		return embed;
	}

	getJSON() {
		return {
			"id": this.id,
			"subject": this.subject.id,
			"tasks": this.tasks,
			"date": this.date,
			//"deadline": "16:10:00",
			"group": this.group,
			"notation": this.notation,
			"details": this.details,
			"link": this.link,
		};
	}


	async persist(group,database) {
		if (this.id === null) { // Nouveau devoir
			const result = await database.postDbData(`homeworks/${group}`, this.getJSON());
			this.id = result.name;
		} else { // Devoir existant : mise à jour
			await database.putDbData(`homeworks/${group}/${this.id}`, this.getJSON());
		}
	}
}

module.exports = Homework;
