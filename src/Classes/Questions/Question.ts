import User from '../User';
import BotLog from '../BotLog';
import Subject from '../Subject';
import * as Discord from 'discord.js';
import * as Embed from '../../embed';
import * as Exceptions from '../Exceptions';
import { isUserHandled } from '../../userLoad';
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

export default abstract class Question {

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
					this.botLog.log(collected.first()?.emoji.name);
					this.emojiActions?.forEach(action => {
						this.botLog.log(action.emoji == collected.first()?.emoji.name + ' -- ' + action.value);
						if (action.emoji == collected.first()?.emoji.name) {
							resolve(action.value);
						}
					});
				}).catch((e) => reject(e));
			}


			const filter = (m: Discord.Message) => m.author.id === this.user.discordUser.id;
			msg.channel.awaitMessages(filter, {
				max: 1,
				time: 120000,
				errors: ['time']
			}).then(answer => {
				const content = answer.first()?.content;
				if (typeof content == 'undefined') {
					reject(new Error('Message response content'));
					return;
				}

				if (this.emojiActions != undefined && content.length == 1) {
					const numAnswerEmoji: number = parseInt(content);
					if (Number(numAnswerEmoji)) {
						if(numAnswerEmoji > 0 && numAnswerEmoji <= this.emojiActions.length){
							resolve(this.emojiActions[numAnswerEmoji - 1].value);
						}
					}
				}
				if (!onlyEmojis)
					resolve(content);
			}).catch((e) => {
				this.botLog.warn(e);
				if (isUserHandled(this.user.discordUser.id))
					this.user.discordUser.send(Embed.getDefaultEmbed('Annulation', 'Temps de réponse trop long')).catch(e => BotLog.error(e));
				msg.delete().catch((e) => BotLog.error(e));
				reject(new Exceptions.QuestionTimeOutException(this.user.discordUser.username));
			});

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
