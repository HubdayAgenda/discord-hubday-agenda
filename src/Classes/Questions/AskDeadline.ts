import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';
import * as Utils from '../../utils';

import { IemojiAction } from '../AddSubjectForm';

export default class AskDeadline extends Question {

	static emojiAction: IemojiAction[] = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];

	/**
	 * Les modules de cet utilisateur hubday
	 */
	subject: Subject;

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getEmojiFormEmbed('Indiquer une heure de remise ?',
				AskDeadline.emojiAction,
				'Donnez l\'heure sous la forme HH:MM',
				'Réagissez avec l\'émoji pour passer ou répondez.',
				this.subject.color
			);
			this.user.discordUser.send(embed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | string[] | number | Subject | boolean | Skip> {
		let response = await super.awaitResponse(msg);

		if(Number(response) == -1){
			return new Skip;
		}

		if (!Utils.hourValid(response.toString())) {
			this.user.discordUser.send(Embed.getDefaultEmbed(
				'Répondez avec une heure valide !',
				null,
				null,
				this.subject.color
			)).catch(e => this.botLog.error(e));
			return await this.awaitResponse(msg);
		}

		response = response.toString() + ':00';
		if (response.toString().length < 8) response = '0' + response;
		return response.toString();
	}

	getContext(): string {
		return 'Choix de l\'heure';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);
		this.emojiActions = AskDeadline.emojiAction;
		this.subject = subject;
	}
}
