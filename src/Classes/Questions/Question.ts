import * as Discord from 'discord.js';
import { isUserHandled } from '../../userLoad';
import User from '../User';
import * as Embed from '../../embed';
import * as Exceptions from '../Exceptions';
import BotLog from '../BotLog';
import Subject from '../Subject';
import { IemojiAction } from '../AddSubjectForm';

export class Skip {
	message: string;
	constructor(message = 'Question passée') {
		this.message = message;
	}
	toString(): string {
		return this.message;
	}
}

export default class Question {

	user: User
	botLog: BotLog;
	emojiActions?: IemojiAction[]

	constructor(user: User, botLog: BotLog) {
		this.user = user;
		this.botLog = botLog;
	}

	/**
	 * Pose cette question
	 * - Envois la question en message discord
	 * - Attend la réponse de l'utilisateur
	 * @returns La réponse
	 */
	async ask(): Promise<string | string[] | number | Subject | boolean | Skip> {
		const msg = await this.send();
		if (msg instanceof Discord.Message)
			return await this.awaitResponse(msg);
		else
			throw new Error('Mauvaise utilisation de la classe Question, la methode send doit être override');
	}

	/**
	 * Attend une réponse à un message donné
	 * @param msg Le message de la question
	 * @returns La réponse
	 */
	awaitResponse(msg: Discord.Message, onlyEmojis = false): Promise<string | string[] | number | Subject | boolean | Skip> {
		return new Promise((resolve, reject) => {

			if (this.emojiActions != undefined) {
				this.emojiActions.forEach(element => {
					msg.react(element.emoji)
						.catch(() => this.botLog.warn('React on deleted message'));
				});

				const filter = (reaction: unknown, reactUser: Discord.User) => {
					return reactUser.id === this.user.discordUser.id;
				};
				msg.awaitReactions(filter, {
					max: 1,
					time: 120000 + 10,
					errors: ['time']
				}).then(collected => {
					this.emojiActions?.forEach(action => {
						if (action.emoji == collected.first()?.emoji.name) {
							if (action.value)
								resolve(action.value);
						}
					});
				}).catch((e) => reject(e));
			}

			if(!onlyEmojis) {
				const filter = (m: Discord.Message) => m.author.id === this.user.discordUser.id;
				msg.channel.awaitMessages(filter, {
					max: 1,
					time: 120000,
					errors: ['time']
				}).then(answer => {
					const content = answer.first()?.content;
					if (typeof content !== 'undefined')
						resolve(content);
				}).catch(() => {
					if (isUserHandled(this.user.discordUser.id))
						this.user.discordUser.send(Embed.getDefaultEmbed('Annulation', 'Temps de réponse trop long')).catch(e => BotLog.error(e));
					msg.delete().catch((e) => BotLog.error(e));
					reject(new Exceptions.TimeOutException(this.user.discordUser.username));
				});
			}
		});
	}

	/**
	 * Envois la question à l'utilisateur sur discord
	 */
	send(): Promise<Discord.Message> | void { }

	/**
	 * Donne les informations de cette question
	 */
	getContext(): string {
		return 'Question class';
	}
}
