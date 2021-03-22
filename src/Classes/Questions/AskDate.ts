import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';
import * as utils from '../../utils';

export default class AskDate extends Question {

	subject: Subject;

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getEmojiFormEmbed(
				'Échéance du devoir',
				this.emojiActions != null ? this.emojiActions : [],
				'Indiquer la date en répondant sous la forme JJ/MM/AAAA',
				'Ou réagissez avec une des propositions ci-dessus',
				this.subject.color
			);
			this.user.discordUser.send(embed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | string[] | number | Subject | boolean | Skip> {
		const response = await super.awaitResponse(msg);

		const date = utils.dateValid(response.toString());
		if (date == null) {
			if (typeof response == 'number') {
				return utils.dateToStringValidFormat(utils.getRelativeDate(response));
			} else {

				this.user.discordUser.send(Embed.getDefaultEmbed(
					'Date invalide',
					'Ajoutez la date sous la forme JJ/MM/AAAA',
					null,
					this.subject.color
				)).catch(e => this.botLog.error(e));

				return this.awaitResponse(msg);
			}
		}
		return utils.dateToStringValidFormat(date);
	}

	getContext(): string {
		return 'Choix de la date';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);

		this.emojiActions = [
			{ 'emoji': '1️⃣', 'value': 1, 'description': 'Pour demain' },
			{ 'emoji': '2️⃣', 'value': 2, 'description': `Pour le ${utils.dateDayToString(utils.getRelativeDate(2))} ${utils.getRelativeDate(2).getDate()}` },
			{ 'emoji': '3️⃣', 'value': 3, 'description': `Pour le ${utils.dateDayToString(utils.getRelativeDate(3))} ${utils.getRelativeDate(3).getDate()}` },
			{ 'emoji': '4️⃣', 'value': 4, 'description': `Pour le ${utils.dateDayToString(utils.getRelativeDate(4))} ${utils.getRelativeDate(4).getDate()}` },
			{ 'emoji': '5️⃣', 'value': 5, 'description': `Pour le ${utils.dateDayToString(utils.getRelativeDate(5))} ${utils.getRelativeDate(5).getDate()}` },
			{ 'emoji': '6️⃣', 'value': 6, 'description': `Pour le ${utils.dateDayToString(utils.getRelativeDate(6))} ${utils.getRelativeDate(6).getDate()}` },
			// { 'emoji': '✌️', 'value': 3, 'description': 'Pour le prochain cour' },
		];
		this.subject = subject;
	}
}
