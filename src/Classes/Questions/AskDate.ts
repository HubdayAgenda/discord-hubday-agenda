import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';
import * as utils from '../../utils';

export default class AskDate extends Question {

	subject: Subject;

	/**@TODO Prochain cour*/
	static emojiAction = [
		{ 'emoji': '1️⃣', 'value': 1, 'description': 'Pour demain' },
		{ 'emoji': '2️⃣', 'value': 2, 'description': 'Pour la semaine prochaine' },
		// { 'emoji': '✌️', 'value': 3, 'description': 'Pour le prochain cour' },
	];

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getEmojiFormEmbed(
				'Échéance du devoir',
				AskDate.emojiAction,
				null,
				'Indiquer la date sous la forme **JJ/MM/AAAA** ou réagissez avec un emoji',
				this.subject.color
			);
			this.user.discordUser.send(embed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | string[] | number | Subject | boolean | Skip> {
		const response = await super.awaitResponse(msg);

		if (typeof response == 'number') {
			switch (response) {
				case 1:
					return utils.dateToStringValidFormat(utils.getRelativeDate(1));
				case 2:
					return utils.dateToStringValidFormat(utils.getNextDay('sunday'));
				default:
					return this.awaitResponse(msg);
			}
		} else {
			const date = utils.dateValid(response.toString());

			if (date == null) {
				this.user.discordUser.send(Embed.getDefaultEmbed(
					'Date invalide',
					'Ajoutez la date sous la forme JJ/MM/AAAA',
					null,
					this.subject.color
				)).catch(e => this.botLog.error(e));

				return this.awaitResponse(msg);
			}

			return utils.dateToStringValidFormat(date);
		}
	}

	getContext(): string {
		return 'Choix de la date';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);
		this.emojiActions = AskDate.emojiAction;
		this.subject = subject;
	}
}
