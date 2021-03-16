import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';
import * as Utils from '../../utils';

import { IemojiAction } from '../AddSubjectForm';

export default class AskGroup extends Question {

	static emojiAction = [
		{ 'emoji': '👌', 'value': 1, 'description': 'Classe entière' },
		{ 'emoji': '☝️', 'value': 2, 'description': 'Groupe prime' },
		{ 'emoji': '✌️', 'value': 3, 'description': 'Groupe seconde' },
	];

	/**
	 * Les modules de cet utilisateur hubday
	 */
	subject: Subject;

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getEmojiFormEmbed('Quel groupe est concerné par ce devoir ?',
				AskGroup.emojiAction,
				'‌‌ ',
				'Réagissez avec l\'émoji correspondant à l\'action souhaitée.',
				this.subject.color
			);

			this.user.discordUser.send(embed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | string[] | number | Subject | boolean | Skip> {
		const response = await super.awaitResponse(msg, true);

		switch (response) {
			case 2:
				return 'prime';
			case 3:
				return 'seconde';
			default:
				return new Skip('Classe entière');
		}
	}

	getContext(): string {
		return 'Choix du groupe';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);
		this.emojiActions = AskGroup.emojiAction;
		this.subject = subject;
	}
}
