import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';
import * as Utils from '../../utils';

import { IemojiAction } from '../AddSubjectForm';

export default class AskLink extends Question {

	static emojiAction: IemojiAction[] = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];

	/**
	 * Les modules de cet utilisateur hubday
	 */
	subject: Subject;

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getEmojiFormEmbed(
				'Ajouter un lien ? (facultatif)',
				AskLink.emojiAction,
				null,
				'Réagissez avec l\'émoji pour passer ou répondez avec un lien.',
				this.subject.color
			);
			this.user.discordUser.send(embed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | string[] | number | Subject | boolean | Skip> {
		const response = await super.awaitResponse(msg);

		if (Number(response) == -1) {
			return new Skip;
		}
		if (!Utils.validURL(response.toString())) {
			this.user.discordUser.send(Embed.getDefaultEmbed(
				'Répondez avec un lien valide !',
				null,
				null,
				this.subject.color
			));
			return this.awaitResponse(msg);
		}
		return response.toString();
	}

	getContext(): string {
		return 'Choix des détails';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);
		this.emojiActions = AskLink.emojiAction;
		this.subject = subject;
	}
}
