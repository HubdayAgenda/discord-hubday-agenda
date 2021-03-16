import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';
import * as Utils from '../../utils';

export default class AskDate extends Question {

	subject: Subject;

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getDefaultEmbed(
				'Échéance du devoir',
				'Indiquer la date sous la forme JJ/MM/AAAA',
				null,
				this.subject.color
			);
			this.user.discordUser.send(embed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | string[] | number | Subject | boolean | Skip> {
		const response = await super.awaitResponse(msg);
		const date = Utils.dateValid(response.toString());

		if(date == null) {
			this.user.discordUser.send(Embed.getDefaultEmbed(
				'Date invalide',
				'Ajoutez la date sous la forme JJ/MM/AAAA',
				null,
				this.subject.color
			)).catch(e => this.botLog.error(e));

			return this.awaitResponse(msg);
		}

		return Utils.dateToStringValidFormat(date);
	}

	getContext(): string {
		return 'Choix de la date';
	}

	constructor(user: User, botLog: BotLog, subject: Subject) {
		super(user, botLog);
		this.subject = subject;
	}
}
