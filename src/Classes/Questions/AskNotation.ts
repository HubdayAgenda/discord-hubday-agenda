import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';

export default class AskNotation extends Question {

	static emojiAction = [
		{ 'emoji': '📈', 'value': 1, 'description': 'Devoir noté' },
		{ 'emoji': '📉', 'value': 2, 'description': 'Devoir non noté' },
		{ 'emoji': '❌', 'value': -1, 'description': 'Non renseigné' },
	];

	subject: Subject;

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getEmojiFormEmbed(
				'Le devoir est-il noté ? (facultatif)',
				AskNotation.emojiAction,
				null,
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

		switch(response) {
			case 1:
				return true;
			case 2:
				return false;
			default:
				return new Skip('Notation non spécifiée');
		}

	}

	getContext(): string {
		return 'Choix de la note';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);
		this.emojiActions = AskNotation.emojiAction;
		this.subject = subject;
	}
}
