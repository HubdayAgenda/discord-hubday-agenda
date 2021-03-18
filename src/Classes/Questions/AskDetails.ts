import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';

import { IemojiAction } from '../AddSubjectForm';

export default class AskDetails extends Question {

	static emojiAction: IemojiAction[] = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];

	subject: Subject;

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getEmojiFormEmbed(
				'Ajouter des détails à ce devoir ? (facultatif)',
				AskDetails.emojiAction,
				'Ici, vous pouvez indiquer des consignes de remise ou d\'autres détails',
				'Réagissez avec l\'émoji pour passer ou répondez.',
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

		return response.toString();
	}

	getContext(): string {
		return 'Choix des détails';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);
		this.emojiActions = AskDetails.emojiAction;
		this.subject = subject;
	}
}
