/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as fetch from 'node-fetch';
import * as Discord from 'discord.js';
import BotLog from './BotLog';
import AddSubjectForm from './AddSubjectForm';
import Homework from './Homework';
import User from './User';
import * as Exception from './Exceptions';
import * as Embed from '../embed';
import * as utils from '../utils';
import { gatherResponse } from '../firebase';
import { handleUser, isUserHandled } from '../userLoad';

// const INTERACTION_TYPE = Object.freeze({
// 	PING: 1,
// 	APPLICATION_COMMAND: 2
// });

const COMMAND_OPTION_TYPE = Object.freeze({
	SUB_COMMAND: 1,
	SUB_COMMAND_GROUP: 2,
	STRING: 3,
	INTEGER: 4,
	BOOLEAN: 5,
	USER: 6,
	CHANNEL: 7,
	ROLE: 8
});


// const INTERACTION_RESPONSE_TYPE = Object.freeze({
// 	PONG: 1, // ACK a Ping
// 	ACKNOWLEDGE: 2, // ACK a command without sending a message, eating the user's input
// 	CHANNEL_MESSAGE: 3, // respond with a message, eating the user's input
// 	CHANNEL_MESSAGE_WITH_SOURCE: 4, // respond with a message, showing the user's input
// 	ACKNOWLEDGE_WITH_SOURCE: 5  // ACK a command without sending a message, showing the user's input
// });

/**
 * Définition des slash commands du bot
 * /agenda ajout  -> ajouter un devoir
 * /agenda liste  -> lister des devoirs
 */
const commandPayload = {
	'name': 'agenda',
	'description': '📚 Permet d\'ajouter des devoirs sur hubday ou de visualiser la liste de vos devoirs à venir',
	'options': [
		{
			'name': 'ajout',
			'description': '📅 Permet d\'ajouter un nouveaux devoir dans hubday',
			'type': COMMAND_OPTION_TYPE.SUB_COMMAND,
		},
		{
			'name': 'liste',
			'description': '📚 Permet d\'obtenir la liste de vos devoirs',
			'type': COMMAND_OPTION_TYPE.SUB_COMMAND,
			'options': [
				{
					'name': 'période',
					'description': 'Période de temps pour laquelle vous souhaitez obtenir la liste des cours',
					'type': COMMAND_OPTION_TYPE.STRING,
					'required': false,
					'choices': [
						{
							'name': '7 prochains jours',
							'value': 'next7days'
						},
						{
							'name': '7 à 14 prochains jours',
							'value': 'next14days'
						},
						{
							'name': '5 prochains devoirs',
							'value': 'next5homeworks'
						},
						{
							'name': '10 prochains devoirs',
							'value': 'next10homeworks'
						},
					]
				}
			]
		},
	]
};


export class SlashCommands {

	/**
	 * Ajoute une slash command sur un serveur
	 * @param guildId id du serveur sur lequel ajouter la commande
	 * @param clientId id du bot
	 * @param botToken token du bot
	 * @param payload commande a ajouter
	 */
	static async addSlashCommand(guildId: string, clientId: string, botToken: string, payload: unknown): Promise<void> {
		const commandsURL = 'https://discordapp.com/api/v8/applications/' + clientId + '/guilds/' + guildId + '/commands';
		const options = {
			'method': 'post',
			'headers': {
				'Authorization': 'Bot ' + botToken,
				'Content-Type': 'application/json',
			},
			'body': JSON.stringify(payload)
		};
		await fetch.default(commandsURL, options);
		// const response = await fetch.default(commandsURL, options);
		// const data = await gatherResponse(response);
	}

	/**
	 * Permet d'afficher la liste des slash commands liées au bot
	 * @param clientId id du bot
	 * @param botToken token du bot
	 */
	static async getGlobalSlashCommands(clientId: string, botToken: string): Promise<void> {
		const commandsURL = 'https://discordapp.com/api/v8/applications/' + clientId + '/commands';

		const options = {
			'method': 'get',
			'headers': {
				'Authorization': 'Bot ' + botToken,
			}
		};

		const response = await fetch.default(commandsURL, options);
		const data = await gatherResponse(response);
		console.log(JSON.stringify(data, null, 2));
	}

	/**
	 * Permet de supprimer une slash command liées au bot
	 * @param clientId id du bot
	 * @param botToken token du bot
	 * @param commandId Id de la commande à supprimer
	 */
	static async deleteGlobalSlashCommand(clientId: string, botToken: string, commandId: string): Promise<void> {
		const commandsURL = 'https://discordapp.com/api/v8/applications/' + clientId + '/commands/' + commandId;

		const options = {
			'method': 'delete',
			'headers': {
				'Authorization': 'Bot ' + botToken,
			}
		};

		await fetch.default(commandsURL, options);
	}

	/**
	 * Permet de créer toutes les slash commands pour le bot
	 * @TODO RETIRER VALEUR DE GUILD ID hard codé
	 * @param clientId id du bot
	 * @param botToken token du bot
	 */
	static updateAgendaCommand(clientId: string, botToken: string): void {
		this.addSlashCommand('796320431569109012', clientId, botToken, commandPayload);
	}

	/**
	 * Permet de traiter une interaction (commande) reçu par le bot
	 * @param client bot discord
	 * @param interaction interaction reçu
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static processInteraction(client: Discord.Client, interaction: any): void {
		BotLog.log('Interaction received');
		BotLog.log(interaction);
	}
}

export default class AgendaSlashCommands extends SlashCommands {

	/**
	 * Permet de lancer une action liée à une slash command ou interaction reçu par le bot
	 * @param client bot discord
	 * @param interaction interaction reçu
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static processInteraction(client: Discord.Client, interaction: any): void {
		const userId = interaction.member ? interaction.member.user.id : interaction.user.id;

		//On cherche l'user qui a fais cette commande
		client.users.fetch(userId).then(user => {
			this.processCommandForDiscordUser(interaction, user);
		}).catch(e => {
			BotLog.error('Impossible de trouver un utilisateur discord ayant exécuté une commande \n' + e);
		});
	}

	/**
	 * Permet de donner l'action à faire en fonction de l'interaction reçu et de son utilisteur
	 * @param interaction L'inetraction soit la commande reçu et à traiter
	 * @param user L'utilisateur qui a fait l'interaction
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static processCommandForDiscordUser(interaction: any, user: Discord.User) {
		User.getFromDiscordUser(user).then((hubdayUser: User) => {
			switch (interaction.data.options[0].name) {
				case 'ajout':
					this.handleAddCommand(hubdayUser);
					break;
				case 'liste':
					this.handleListCommand(hubdayUser, interaction);
					break;
			}
		}).catch(e => {
			user.send(Embed.getDefaultEmbed(
				'Vous n\'avez pas été reconnu comme membre hubday',
				'Vous devez rejoindre ce serveur discord pour que le bot vous reconnaisse: https://discord.iut-info.cf'
			)).catch((e) => BotLog.error(e));
			BotLog.warn(e);
		});
	}

	/**
	 * Commande /agenda liste
	 * @param hubdayUser Utilisateur hubday cncerné
	 * @param interaction Interaction faite par l'utilisateur
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static async handleListCommand(hubdayUser: User, interaction: any) {

		let start: Date = new Date();
		let end: Date = utils.getRelativeDate(7);


		if (interaction.data.options[0].options !== undefined) {
			switch (interaction.data.options[0].options[0].value) {
				case 'next14days':
					start = end;
					end = utils.getRelativeDate(14);
					break;

				case 'next5homeworks':
					/**
					 * @TODO
					 */
					break;

				case 'next10homeworks':
					/**
					 * @TODO
					 */
					break;
			}
		}

		const listHomework: Homework[] = await Homework.getHomeworks(hubdayUser, start, end);

		hubdayUser.discordUser.send(Embed.getDefaultEmbed(
			'Voici la liste de vos devoirs :',
			`Du ${utils.dateToStringValidFormat(start)} au ${utils.dateToStringValidFormat(end)}`
		)).catch(e => BotLog.error(e));

		listHomework.forEach(hm => {
			hubdayUser.discordUser.send(hm.getEmbed(false)).catch(e => {
				BotLog.error(e);
			});
		});
	}

	/**
	 * Commande /agenda ajout
	 * @param hubdayUser Utilisateur concerné par la commande
	 */
	private static handleAddCommand(hubdayUser: User) {
		if (isUserHandled(hubdayUser.discordUser.id)) {
			hubdayUser.discordUser.send(Embed.getDefaultEmbed(
				'Vous utilisez déjà le bot',
				'Continuez de répondre et finissez l\'ajout d\'un devoir avant de refaire une commande'
			)).catch(e => BotLog.error(e));
			return;
		}
		handleUser(hubdayUser.discordUser);

		hubdayUser.discordUser.send(Embed.getDefaultEmbed(
			'Ajouter un devoir :',
			'Répondez aux questions suivantes pour créer un nouveau devoir'
		)).catch(e => BotLog.error(e));

		const form = new AddSubjectForm(hubdayUser);
		form.start()
			.then(homework => {
				homework.persist(hubdayUser.getCurrentGroup());
				hubdayUser.discordUser.send(homework.getEmbed())
					.catch(e => BotLog.error(e));
			})
			.catch((e) => {
				handleUser(hubdayUser.discordUser, true); // En cas d'erreur dans le formulaire à n'importe quel moment, on retire l'utilisateur des utilisateurs actifs
				if (e instanceof Exception.TimeOutException)
					BotLog.warn('[Alerte formulaire] (Temps de réponse trop long à une question : ' + e.message + ')');
				else
					BotLog.error('[Erreur formulaire] ' + e);
			});
	}
}
