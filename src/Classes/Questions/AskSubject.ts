import Subject from '../Subject';
import User from '../User';
import Question from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';

export default class AskSubject extends Question {

	/**
	 * Les modules de cet utilisateur hubday
	 */
	subjects: Subject[];

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			Embed.getMatieresEmbed(this.subjects).then(embed => {
				this.user.discordUser.send(embed)
					.then(msg => resolve(msg))
					.catch(e => BotLog.error(e));
			}).catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | number | Subject> {
		const response = Number(await super.awaitResponse(msg));

		if (isNaN(response)) {
			this.botLog.warn('Réponse n\'est pas un chiffre');

			await this.user.discordUser.send(Embed.getDefaultEmbed(
				'Répondez avec un chiffre valide',
			)).catch((e) => this.botLog.error(e));

			return await this.awaitResponse(msg);
		}

		if (response <= 0 || response > this.subjects.length) {
			this.botLog.warn('Réponse n\'est pas un chiffre valide');

			await this.user.discordUser.send(Embed.getDefaultEmbed(
				'Répondez avec un chiffre du tableau',
			)).catch((e) => this.botLog.error(e));

			return await this.awaitResponse(msg);
		}

		return this.subjects[response - 1];
	}

	getContext(): string {
		return 'Choix du module';
	}

	constructor(user: User, botLog: BotLog, subjects: Subject[]) {
		super(user, botLog);
		this.subjects = subjects;
	}
}
