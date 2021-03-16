import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';

export default class AskTasks extends Question {

	/**
	 * Les modules de cet utilisateur hubday
	 */
	subject: Subject;

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getDefaultEmbed(
				`Nouveau devoir pour le cours de ${this.subject.getDisplayName()}`,
				'Veuillez indiquer la liste des tâches à effectuer pour ce devoir',
				'Répondez sous la forme :\n tâche 1 | tâche 2 | tâche 3 | ...',
				this.subject.color,
			);
			this.user.discordUser.send(embed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | string[] | number | Subject | boolean | Skip> {
		const response = await super.awaitResponse(msg);

		const tasks: string[] = [];
		response.toString().split('|').forEach((task: string) => {
			tasks.push(task.trim());
		});
		return tasks;
	}

	getContext(): string {
		return 'Choix des taches';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);
		this.subject = subject;
	}
}
