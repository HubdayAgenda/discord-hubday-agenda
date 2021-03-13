import User from './User';
import * as Discord from 'discord.js';
import { sendErrorsHook } from '../webhooks';
import config from '../config';

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
	content: string | boolean | number | unknown;
	timestamp: string;
}

export default class BotLog {

	/**
	 * Instance unique qui est utilisée lorsque l'on log sans créer d'instance de BotLog avant
	 */
	static Instance = new BotLog();

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
	 * @returns Les dernières logs de cette instance (- de 1500 chars), ou tout si noLimit = true
	 */
	public getLastMessages(noLimit = false): string {
		let result = '';
		this.messages.forEach(element => {
			result += `${this.getContentString(element)}\n`;
		});
		if (result.length > 1500 && !noLimit)
			result = '...' + result.slice(-1500);
		return result;
	}

	public getMessagesFile(): Discord.MessageAttachment {
		return new Discord.MessageAttachment(Buffer.from(this.getLastMessages(), 'utf8'), 'bot_logs.txt');
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
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	info(content: unknown): void {
		const message: IBotLogMessage = {
			level: BotLogLevel.All,
			content: content,
			timestamp: this.getTimeStampString()
		};
		this.messages.push(message);
		if (this != BotLog.Instance)
			BotLog.Instance.messages.push(message);
		this.checkHook(message);
		console.info(this.getContentStringColored(message));
	}
	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	static info(content: unknown): void {
		BotLog.Instance.info(content);
	}

	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	log(content: unknown): void {
		const message: IBotLogMessage = {
			level: BotLogLevel.All,
			content: content,
			timestamp: this.getTimeStampString()
		};
		this.messages.push(message);
		if (this != BotLog.Instance)
			BotLog.Instance.messages.push(message);
		this.checkHook(message);
		console.log(this.getContentStringColored(message));
	}
	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	static log(content: unknown): void {
		BotLog.Instance.log(content);
	}

	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	warn(content: unknown): void {
		const message: IBotLogMessage = {
			level: BotLogLevel.Warn,
			content: content,
			timestamp: this.getTimeStampString()
		};
		this.messages.push(message);
		if (this != BotLog.Instance)
			BotLog.Instance.messages.push(message);
		this.checkHook(message);
		console.warn(this.getContentStringColored(message));
	}
	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	static warn(content: unknown): void {
		BotLog.Instance.warn(content);
	}

	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	error(content: unknown): void {
		const message: IBotLogMessage = {
			level: BotLogLevel.Errors,
			content: content,
			timestamp: this.getTimeStampString()
		};
		this.messages.push(message);
		if (this != BotLog.Instance)
			BotLog.Instance.messages.push(message);
		this.checkHook(message);
		console.error(this.getContentStringColored(message));
	}
	/**
	 * Envois un message d'erreur
	 * @param content contenu du message
	 */
	static error(content: unknown): void {
		BotLog.Instance.error(content);
	}

	/**
	 * Permet de vérifier si un message doit enclenché le web hook
	 * @param content contenu du message
	 */
	private checkHook(message: IBotLogMessage): boolean {
		if (message.level >= config.global.logHookLevel) {
			this.hookLogMessages();
			return true;
		}
		return false;
	}

	/**
	 * Envois via webhook la liste des messages (Log déjà reçu par cette instance)
	 */
	hookLogMessages(): void {
		/**
		 * @TODO Webhook cause des erreurs pour les test et sans raison apparente
		 * (L'erreur vient d'ici mais ce code n'est pas éxécuté en toute ogique durant les tests)
		 */
		// sendErrorsHook(this);
	}

	white = '\x1b[37m';
	yellow = '\x1b[33m';
	cyan = '\x1b[36m';
	magenta = '\x1b[35m';
	red = '\x1b[31m';

	/**
	 * Permet de créer la forme du message utilisée dans le terminal (Avec couleur et infos assemblées proprement)
	 * @param content contenu du message
	 * @returns String colorée représentant le contenu du message
	 */
	private getContentStringColored(message: IBotLogMessage): string {
		const _time = `[${this.yellow}${message.timestamp}${this.white}]`;
		const _user = this.getUsernameString() ? `[${this.magenta}${this.getUsernameString()}${this.white}]` : '';
		const _title = this.title ? `${this.cyan}${this.title}${this.white} - ` : '';
		const content = `${this.getContentColor(message.level)}${message.content}`;
		return ` ${_time}${_user} ${_title}${content}${this.white}`;
	}

	/**
	 * Permet de créer la forme du message utilisée dans le terminal (Avec couleur et infos assemblées proprement)
	 * @param content contenu du message
	 * @returns String colorée représentant le contenu du message
	 */
	private getContentString(message: IBotLogMessage): string {
		const _time = `[${message.timestamp}]`;
		const _user = this.getUsernameString() ? `[${this.getUsernameString()}]` : '';
		const _title = this.title ? `${this.title}- ` : '';
		const content = `${message.content}`;
		return ` ${_time}${_user} ${_title}${content}`;
	}

	/**
	 * @returns L'heure actuelle sous forme de string HH:MM:SS
	 */
	private getTimeStampString(): string {
		const date = new Date();
		return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
	}

	private getContentColor(level: BotLogLevel) {
		switch (level) {
			default:
				return this.white;
			case BotLogLevel.Warn:
				return this.yellow;
			case BotLogLevel.Errors:
				return this.red;
		}
	}

	getUsernameString(): string | null {
		if (this.hubdayUser)
			return this.hubdayUser.displayName;
		else if (this.discordUser)
			return `${this.discordUser.username}#${this.discordUser.discriminator}`;
		return null;
	}
}
