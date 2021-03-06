import { User } from './User';
import * as Discord from 'discord.js';

/**
 * Niveaux de logs possible (Seuil de déclanchement du webhook discord)
 */
export enum BotLogLevel {
	All, /*Warning + Errors + Logs + Infos */
	Warn, /*Warnings + Errors*/
	Errors, /*Errors*/
}

/**
 * Contenu d'un message avec son niveau de log
 */
export interface IBotLogMessage {
	level: BotLogLevel;
	message: string | boolean | number | unknown;
}

export class BotLog {

	/**
	 * Niveau de log qui declenche le webhook (Warn par defaut) -> si un warn est utilisé, un message sera envoyé sur discord
	 */
	static hookLevel: BotLogLevel = BotLogLevel.Warn;

	/**
	 * Liste des messages globaux envoyés
	 */
	static messages: IBotLogMessage[] = []

	/**
	 * Titre d'une instance de botLog (Ex: formulaire)
	 */
	private title = '';

	/**
	 * Liste des messages que contient cette instance
	 */
	private messages: IBotLogMessage[] = [];

	/**
	 * Utilisateur discord concerné par cette instance
	 */
	private hubdayUser: User | null = null;

	/**
	 * Utilisateur hubday concerné par cette instance
	 */
	private discordUser: Discord.User | null = null;

	constructor(title = '', discordUser: Discord.User | null = null, hubdayUSer: User | null = null) {
		this.title = title;
		this.hubdayUser = hubdayUSer;
		this.discordUser = discordUser;
	}

	/**
	 * Assigne a cette instance un utilisateur hubday
	 * @param hubdayUser utilisateur a assigner
	 */
	setHubdayUser(hubdayUser: User): void {
		this.hubdayUser = hubdayUser;
	}

	/**
	 * Assigne a cette instance un utilisateur discord
	 * @param discordUser utilisateur a assigner
	 */
	setDiscordUser(discordUser: Discord.User): void {
		this.discordUser = discordUser;
	}

	/**
	 * Envois un message d'information
	 * @param content contenu du message
	 */
	info(content: unknown): void {
		BotLog.info(content, this.messages);
		console.info(this.getContentStringColored(content));
	}

	/**
	 * Envois un message d'information
	 * @param content contenu du message
	 */
	static info(content: unknown, msgs: IBotLogMessage[] | null = null): void {
		const message = {
			level: BotLogLevel.All,
			message: content
		};
		if(msgs)
			this.messages.push(message);
		else {
			BotLog.messages.push(message);
			console.info(this.getContentStringColored(content));
		}
		BotLog.checkHook(message);
	}

	/**
	 * Envois un message de log
	 * @param content contenu du message
	 */
	log(content: unknown): void {
		BotLog.log(content, this.messages);
		console.info(this.getContentStringColored(content));
	}

	/**
	 * Envois un message de log
	 * @param content contenu du message
	 */
	static log(content: unknown, msgs: IBotLogMessage[] | null = null): void {
		const message = {
			level: BotLogLevel.All,
			message: content
		};
		if(msgs)
			this.messages.push(message);
		else {
			BotLog.messages.push(message);
			console.log(this.getContentStringColored(content));
		}
		BotLog.checkHook(message);
	}

	/**
	 * Envois un message d'avertissement
	 * @param content contenu du message
	 */
	warn(content: unknown): void {
		BotLog.warn(content, this.messages);
		console.info(this.getContentStringColored(content));
	}

	/**
	 * Envois un message d'avertissement
	 * @param content contenu du message
	 */
	static warn(content: unknown, msgs: IBotLogMessage[] | null = null): void {
		const message = {
			level: BotLogLevel.Warn,
			message: content
		};
		if(msgs)
			this.messages.push(message);
		else {
			BotLog.messages.push(message);
			console.warn(this.getContentStringColored(content));
		}
		BotLog.checkHook(message);
	}

	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	error(content: unknown): void {
		BotLog.error(content, this.messages);
		console.info(this.getContentStringColored(content));
	}

	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	static error(content: unknown, msgs: IBotLogMessage[] | null = null): void {
		const message = {
			level: BotLogLevel.Errors,
			message: content
		};
		if(msgs)
			this.messages.push(message);
		else {
			BotLog.messages.push(message);
			console.error(this.getContentStringColored(content));
		}
		BotLog.checkHook(message);
	}

	/**
	 * Permet de vérifier si un message doit enclenché le web hook
	 * @param content contenu du message
	 */
	private static checkHook(message: IBotLogMessage): boolean {
		if (message.level <= this.hookLevel) {
			BotLog.hookLogMessages();
			return true;
		}
		return false;
	}

	/**
	 * @TODO
	 */
	static hookLogMessages(): void {

	}

	static white = '\x1b[37m';
	static yellow = '\x1b[33m';
	static cyan = '\x1b[36m';
	static magenta = '\x1b[35m';

	/**
	 * Permet de créer la forme du message utilisée dans le terminal (Avec couleur et infos assemblées proprement)
	 * @param content contenu du message
	 * @returns String colorée représentant le contenu du message
	 */
	private getContentStringColored(content: unknown): string {
		return BotLog.getContentStringColored(content, this.title, this.hubdayUser?.displayName || this.discordUser?.username || null);
	}

	/**
	 * Permet de créer la forme du message utilisée dans le terminal (Avec couleur et infos assemblées proprement)
	 * @param content contenu du message
	 * @returns String colorée représentant le contenu du message
	 */
	private static getContentStringColored(content: unknown, title: string | null = null, user: string | null = null): string {
		const _time = `[${this.yellow}${this.getTimeStamp()}${this.white}]`;
		const _user = user ? `[${this.magenta}${user}${this.white}]` : '';
		const _title = title ? `${this.cyan}${title}${this.white} - ` : '';
		return ` ${_time}${_user} ${_title}${content}${this.white}`;
	}

	/**
	 * @returns L'heure actuelle sous forme de string HH:MM:SS
	 */
	private static getTimeStamp(): string {
		const date = new Date();
		return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
	}
}
