import * as Discord from 'discord.js'
import * as fireBase from './firebase';

export interface ISubject {
	id: string
	aliases: string[];
	color: string,
	displayId: string,
	displayName: string,
	groups: string[],
	icon: string,
	moodle: string,
	name: string,
	options: string[]
	shortName: string,
	teachingUnit: string
}

export class Homework {
	subject: ISubject;
	id: string | null;
	tasks: string[];
	date: string;
	group: string | null;
	details: string | null;
	link: string;
	notation: boolean | null;
	lessonId: string | null;

	constructor(subject: ISubject, tasks: string[], date: string, /*deadline,*/ group: string | null, details: string | null, link: string, notation: boolean | null, lessonId: string | null) {
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

	async persist(group: string) {
		if (this.id === null) { // Nouveau devoir
			const result = await fireBase.postDbData(`homeworks/${group}`, this.getJSON());
			this.id = result.name;
		} else { // Devoir existant : mise à jour
			await fireBase.putDbData(`homeworks/${group}/${this.id}`, this.getJSON());
		}
	}
}
