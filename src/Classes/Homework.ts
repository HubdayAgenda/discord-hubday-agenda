import * as Discord from 'discord.js';
import * as fireBase from '../firebase';
import * as utils from '../utils';
import Subject, { getSubjects } from './Subject';
import User from './User';

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
	constructor(
		subject: Subject,
		tasks: string[],
		date: string,
		deadline: string | null,
		group: string | null,
		details: string | null,
		link: string | null,
		notation: boolean | null
	) {
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
	getEmbed(addConfirmation = true): Discord.MessageEmbed {
		const embed = new Discord.MessageEmbed()
			.setColor(this.subject.color)
			.setTitle(this.subject.getDisplayName())
			.setURL('https://www.hubday.fr/dashboard#subject/' + this.subject.id)
			.setAuthor(
				addConfirmation ? 'Devoir enregistré avec succès ! [Voir]' : 'Devoir à faire ! [Voir]',
				'https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png',
				'https://www.hubday.fr/dashboard#homework/' + this.id + '/view')
			.setFooter('Échéance', 'https://images.emojiterra.com/google/android-nougat/512px/23f1.png')
			.setTimestamp(
				this.deadline ?
					utils.dateAndHourToDate(this.date, this.deadline) :
					new Date(this.date).setHours(0, 0, 0)
			);

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

	/**
	 * Permet de récupérer les devoirs pour un utilisateur dans une période données
	 * @param hubdayUser L'utilisateur concerné par les devoirs
	 * @param start La date de début de la période qui comprend les devoirs à récupérer (Incluse)
	 * @param end La date de fin de la période qui comprend les devoirs à récupérer (Incluse)
	 * @returns La liste des devoirs dans la période spécifié
	 */
	static async getHomeworks(hubdayUser: User, start: Date, end: Date): Promise<Homework[]> {

		const homeworks = await fireBase.getDbDataWithLimits(
			`homeworks/${hubdayUser.getCurrentGroup()}`,
			'date',
			utils.dateToStringValidFormat(start),
			utils.dateToStringValidFormat(end)
		);

		const hmArray: Homework[] = [];

		for (const key in homeworks) {
			const homeworkObject = homeworks[key];

			const subjects = await getSubjects();

			hmArray.push(new Homework(
				subjects[homeworkObject.subject],
				homeworkObject.tasks,
				homeworkObject.date,
				homeworkObject.deadline ?? null,
				homeworkObject.group ?? null,
				homeworkObject.details ?? null,
				homeworkObject.link ?? null,
				homeworkObject.notation ?? null
			));
		}

		return hmArray;
	}

}
