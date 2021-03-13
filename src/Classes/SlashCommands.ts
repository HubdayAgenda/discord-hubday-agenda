/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as fetch from 'node-fetch';
import { gatherResponse } from '../firebase';
import * as Discord from 'discord.js';
import BotLog from './BotLog';
import * as AddForm from '../addForm';
import * as Exceptions from '../Classes/Exceptions';
import { handleUser } from '../userLoad';
import Homework from './Homework';
import User from './User';
import * as Embed from '../embed';
import * as utils from '../utils';

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


export default class SlashCommands {

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
	 * Permet de lancer une action liée à une slash command ou interaction reçu par le bot
	 * @param client bot discord
	 * @param interaction interaction reçu
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static processInteraction(client: Discord.Client, interaction: any): void {
		const userId = interaction.member ? interaction.member.user.id : interaction.user.id;

		//On cherche l'user qui a fais cette commande
		client.users.fetch(userId).then(user => {
			this.processCommandForUser(interaction, user);
		}).catch(e => {
			BotLog.error('Impossible de trouver un utilisateur discord ayant exécuté une commande \n' + e);
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static processCommandForUser(interaction: any, user: Discord.User) {
		switch (interaction.data.options[0].name) {
			case 'ajout':
				this.handleAddForm(user);
				break;
			case 'liste':
				this.handleHomeWorkList(user, interaction);
				break;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static async handleHomeWorkList(user: Discord.User, interaction: any) {
		user.send('Liste de vos devoirs :');

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


		const hubdayUser = await User.getFromDiscordId(user.id);
		if (hubdayUser === null) {
			user.send(Embed.getDefaultEmbed(
				'Vous n\'avez pas été reconnu comme membre hubday',
				'Vous devez rejoindre ce serveur discord pour que le bot vous reconnaisse: https://discord.iut-info.cf'
			)).catch((e) => BotLog.error(e));
			BotLog.warn('Utilisateur non enregistré sur Hubday');
			return;
		}

		const listHomework: Homework[] = await Homework.getHomeworks(hubdayUser, start, end);

		listHomework.forEach(hm => {
			user.send(hm.getEmbed(false)).catch(e => {
				BotLog.error(e);
			});
		});
	}

	private static handleAddForm(user: Discord.User) {
		user.send('Ajouter un devoir');
		AddForm.startAddForm(user).catch((e) => {
			handleUser(user, true); // En cas d'erreur dans le formulaire à n'importe quel moment, on retire l'utilisateur des utilisateurs actifs
			if (e instanceof Exceptions.TimeOutException)
				BotLog.warn('[Alerte formulaire] (Temps de réponse trop long à une question : ' + e.message + ')');
			else if (e instanceof Exceptions.UndefinedHubdayUser)
				BotLog.warn('[Alerte formulaire] (Utilisateur hubday inconnu: ' + e.message + ')');
			else
				BotLog.error('[Erreur formulaire] ' + e);
		});
	}
}
