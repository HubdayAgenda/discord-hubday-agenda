/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import AddSubjectForm from '../AddSubjectForm';
import Homework from '../Homework';
import User from '../User';
import SlashCommands from './SlashCommands';
import BotLog from '../BotLog';
import * as Exception from '../Exceptions';
import * as Embed from '../../embed';
import * as utils from '../../utils';
import * as Discord from 'discord.js';
import { handleUser, isUserHandled } from '../../userLoad';

export default class AgendaSlashCommands extends SlashCommands {

	/**
	 * Définition des slash commands du bot
	 * /agenda ajout  -> ajouter un devoir
	 * /agenda liste  -> lister des devoirs
	 */
	static commandPayload = {
		'name': 'agenda',
		'description': '📚 Permet d\'ajouter des devoirs sur hubday ou de visualiser la liste de vos devoirs à venir',
		'options': [
			{
				'name': 'ajout',
				'description': '📅 Permet d\'ajouter un nouveaux devoir dans hubday',
				'type': SlashCommands.COMMAND_OPTION_TYPE.SUB_COMMAND,
			},
			{
				'name': 'liste',
				'description': '📚 Permet d\'obtenir la liste de vos devoirs',
				'type': SlashCommands.COMMAND_OPTION_TYPE.SUB_COMMAND,
				'options': [
					{
						'name': 'période',
						'description': 'Période de temps pour laquelle vous souhaitez obtenir la liste des cours',
						'type': SlashCommands.COMMAND_OPTION_TYPE.STRING,
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
							// {
							// 	'name': '5 prochains devoirs',
							// 	'value': 'next5homeworks'
							// },
							// {
							// 	'name': '10 prochains devoirs',
							// 	'value': 'next10homeworks'
							// },
						]
					}
				]
			},
		]
	};

	public static addAgendaSlashCommand(client: Discord.Client): void {
		super.addSlashCommand(client, AgendaSlashCommands.commandPayload);
	}

	/**
	 * Permet de lancer une action liée à une slash command ou interaction reçu par le bot
	 * @param client bot discord
	 * @param interaction interaction reçu
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static processInteraction(client: Discord.Client, interaction: any): void {
		super.processInteraction(client, interaction);

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

			if (isUserHandled(hubdayUser.discordUser.id)) {
				hubdayUser.discordUser.send(Embed.getDefaultEmbed(
					'Vous utilisez déjà le bot',
					'Continuez de répondre et finissez l\'ajout d\'un devoir avant de refaire une commande'
				)).catch(e => BotLog.error(e));
				return;
			}

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

		if(listHomework.length == 0){
			hubdayUser.discordUser.send(Embed.getDefaultEmbed(
				'Vous n\'avez pas de devoirs',
				`Du ${utils.dateToStringValidFormat(start)} au ${utils.dateToStringValidFormat(end)}`
			)).catch(e => BotLog.error(e));
		} else {
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
	}

	/**
	 * Commande /agenda ajout
	 * @param hubdayUser Utilisateur concerné par la commande
	 */
	private static handleAddCommand(hubdayUser: User) {

		hubdayUser.discordUser.send(Embed.getDefaultEmbed(
			'Ajouter un devoir :',
			'Répondez aux questions suivantes pour créer un nouveau devoir'
		)).catch(e => BotLog.error(e));

		const form = new AddSubjectForm(hubdayUser);

		handleUser(hubdayUser.discordUser);

		form.start()
			.then(homework => {
				homework.persist(hubdayUser.getCurrentGroup()).then(() => {
					hubdayUser.discordUser.send(homework.getEmbed(true))
						.catch(e => BotLog.error(e));
				}).catch(e => BotLog.error(e));
			})
			.catch((e) => {
				if (e instanceof Exception.QuestionTimeOutException)
					BotLog.warn('[Alerte formulaire] (Temps de réponse trop long à une question : ' + e.message + ')');
				else
					BotLog.error('[Erreur formulaire] ' + e);
			}).finally(() => {
				handleUser(hubdayUser.discordUser, true);
			});
	}
}
