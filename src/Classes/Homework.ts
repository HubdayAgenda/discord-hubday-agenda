import * as Discord from 'discord.js';
import * as fireBase from '../firebase';
import Subject from './Subject';

export default class Homework {

	/**
	 * Le module de ce devoir
	 */
	subject: Subject;

	/**
	 * L'id de ce devoir (null par defaut, l'id est donné par la db hubday via persist)
	 * @see persyst
	 */
	id: string | null;

	/**
	 * Liste des tâches pour ce devoir
	 * (Au moins une nécéssaire)
	 */
	tasks: string[];

	/**
	 * Date du devoir
	 * /!\ sous la forme : YYYY-MM-DD
	 */
	date: string;

	/**
	 * Heure de remise du devoir
	 * /!\ sous la forme : HH:MM
	 */
	deadline: string | null;

	/**
	 * Type du groupe
	 * "prime" ou "seconde" ou null
	 */
	group: string | null;

	/**
	 * Details pour ce devoir (facultatif)
	 */
	details: string | null;

	/**
	 * Lien associé à ce devoir
	 * (Nécéssite que details ne soit pas null)
	 */
	link: string | null;

	/**
	 * Indique si ce devoir est noté
	 * null = non spécifié
	 */
	notation: boolean | null;

	/**
	 * L'id du cours associé à ce devoir
	 */
	lessonId: string | null;

	/**
	 * Créer un nouveau devoir et l'envoyer sur la base de donnée Hubday
	 * @param subject Module du devoir
	 * @param tasks liste des taches du devoir
	 * @param date date de remise du devoir
	 * @param group group concerné
	 * @param details details du devoir
	 * @param link lien lié au details du devoir
	 * @param notation indique si le devoir est noté
	 * @param lessonId id de la lesson associé au devoir
	 */
	constructor(subject: Subject, tasks: string[], date: string, deadline: string | null, group: string | null, details: string | null, link: string | null, notation: boolean | null) {
		this.id = null;
		this.subject = subject;
		this.tasks = tasks;
		this.date = date;
		this.deadline = deadline;
		this.group = group;
		this.details = details;
		this.link = link;
		this.notation = notation;
		this.lessonId = null;
	}

	/**
	 * Créer un embed a partir de ce devoir avec toutes ses informations
	 * @return l'embed de ce devoir
	 */
	getEmbed(): Discord.MessageEmbed {
		const embed = new Discord.MessageEmbed()
			.setColor(this.subject.color)
			.setTitle(`${this.subject.displayId} - ${this.subject.getDisplayName()}`)
			.setURL('https://www.hubday.fr/dashboard#subject/' + this.subject.id)
			.setAuthor('Devoir enregistré avec succès ! [Voir]', 'https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png', 'https://www.hubday.fr/dashboard#homework/' + this.id + '/view')
			.setFooter('Échéance', 'https://images.emojiterra.com/google/android-nougat/512px/23f1.png')
			.setTimestamp(new Date(this.date));

		let description = '';

		if (this.details !== null) {
			if (this.details !== null) description += (`[${this.details}](${this.link})\n`);
			else description += this.details + '\n';
		}

		this.tasks.forEach(element => {
			description += `\n🔳 ${element}\n`;
		});

		description += (this.notation !== null ? (this.notation ? '\n📈 Devoir noté\n' : '\n📉 Devoir non noté\n') : '');

		description += '‌‌ ';

		embed.setDescription(description);

		return embed;
	}

	/**
	 * Retourne ce devoir sous forme JSON
	 * @return objet json de ce devoir
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	getJSON() {
		return {
			'id': this.id,
			'subject': this.subject.id,
			'tasks': this.tasks,
			'date': this.date,
			'deadline': this.deadline,
			'group': this.group,
			'notation': this.notation,
			'details': this.details,
			'link': this.link,
		};
	}

	/**
	 * Envois ce devoir sur la base de donnée Hubday ou le met à jour si il est déjà enregistré
	 * @param group group concerné par ce devoir
	 */
	async persist(group: string): Promise<void> {
		if (this.id === null) { // Nouveau devoir
			const result = await fireBase.postDbData(`homeworks/${group}`, this.getJSON());
			this.id = result.name;
		} else { // Devoir existant : mise à jour
			await fireBase.putDbData(`homeworks/${group}/${this.id}`, this.getJSON());
		}
	}
}
