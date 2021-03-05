/* eslint-disable @typescript-eslint/no-var-requires */
require('better-logging')(console);
const dotenv = require('dotenv');

if (process.env.DISCORD_BOT_TOKEN === undefined || process.env.RTDB_URL === undefined || process.env.RTDB_AUTH_TOKEN === undefined) {
	const result = dotenv.config({ path: 'env.local' });
	if (
		result.error
		|| process.env.DISCORD_BOT_TOKEN === undefined
		|| process.env.RTDB_URL === undefined
		|| process.env.RTDB_AUTH_TOKEN === undefined
		|| process.env.DISCORD_BOT_VERSION === undefined
		|| process.env.DISCORD_BOT_PREFIX === undefined
	) {
		console.error('Unable to retrieve environment variables from system or config file. Please define these or create a configuration file \'env.local\'.');
		process.exit(1);
	}
}

import * as Embed from './embed';
import * as AddForm from './addForm';
import { sendReportHook } from './webhooks';
import * as Discord from 'discord.js';
const client = new Discord.Client();

/**
 * Liste des id discords des utilisateurs en train d'utiliser le bot
 */
const USER_LOAD: string[] = [];

/**
 * Gère les utilisateurs discord en train d'utiliser le bot.
 *
 * En cas de soucis de gestion, un utilisateur est noté comme
 * "plus en train d'utiliser le bot" après 2 mins.
 *
 * @param id id de l'utilisateur a manager
 * @return -1 si l'utilisateur est déjà managé (soit déjà en train d'utiliser le bot)
 */
export const handleUser = (id: string, remove = false): number | void => {
	if (USER_LOAD.includes(id)) {
		if (remove) {
			USER_LOAD.splice(USER_LOAD.indexOf(id), 1);
			console.info(`[UserLoad : ${USER_LOAD.length}] User unhandled correctly with id : ` + id);
		} else {
			console.info(`[UserLoad : ${USER_LOAD.length}] User already handled with id : ` + id);
			return -1;
		}
	} else if (!remove) {
		USER_LOAD.push(id);
		console.info(`[UserLoad : ${USER_LOAD.length}] New user handled with id : ` + id);
		async () => {
			setTimeout(() => {
				handleUser(id, true);
				console.warn(`[UserLoad : ${USER_LOAD.length}] User automatically unhandled with id : ` + id + '(timeout)');
			}, 120000);
		};
	}
};

/**
 *
 * @param id l'id de l'utilisateur a rechercher
 * @return vrai si l'utilisateur est enregistré
 */
export const isUserHandled = (id: string): boolean => {
	return USER_LOAD.includes(id);
};

export interface IbotAction {
	name: string,
	emoji: string;
	action: null | ((arg0: Discord.User) => void);
}

/**
 * Actions du bot, choisissable depuis un message de menu (Premier MP du bot après /agenda)
 *  - name : (requis) nom de l'action (sera affiché)
 *  - emoji : (requis) utilisé pour la selection de l'action via un message de menu
 *  - action : (facultatif) si present, envois vers une fonction à éxécuter
 */
export const BOT_ACTIONS: IbotAction[] = [
	{
		'name': 'Ajouter un devoir',
		'emoji': '✅',
		'action': (user: Discord.User) => AddForm.startAddForm(user)
	},
	// {
	// 	'name': 'Modifier un devoir',
	// 	'emoji': '💬',
	// 	'action': null
	// },
	// {
	// 	'name': 'Supprimer un devoir',
	// 	'emoji': '❌',
	// 	'action': null
	// },
	{
		'name': 'Reporter un bug',
		'emoji': '📣',
		'action': (process.env.DISCORD_BUG_REPORT_WEBHOOK_URL !== undefined) ? ((user: Discord.User): void => {
			sendReportHook(user);
		}) : null
	}
];


client.on('ready', async () => {
	/**
	 * Enregistrement de la commande /agenda
	 */
	// client.api.applications(client.user?.id).commands.post({
	// 	data: { name: "agenda", description: "Permet de gérer les devoirs dans l'agenda Discord et Hudbay" }
	// });

	/**
	 * Enregistrement listener des commandes
	 */
	// client.ws.on("INTERACTION_CREATE", async interaction => {
	// 	(interaction.data.name.toLowerCase() === "agenda") && onBotCommand(interaction.member ? interaction.member.user.id : interaction.user.id);
	// });


	console.log('========================================');
	console.log('             Bot started !              ');
	console.log('========================================');

	const status = async () => {
		setTimeout(() => {
			client.user?.setActivity('/agenda');
			setTimeout(() => {
				client.user?.setActivity('hubday.fr', { type: 'WATCHING' });
				status();
			}, 20000);
		}, 20000);
	};
	status();
});


client.on('message', msg => {
	if (msg.channel.type === 'dm') {


		// TEST -> LANCER LE MENU DIRECT AVEC
		if (msg.author.id !== client.user?.id && !USER_LOAD.includes(msg.author.id)) {
			onBotCommand(msg.author.id);
		}



		if (process.env.DISCORD_BOT_PREFIX != undefined) {
			// On regarde si le message commence bien par le prefix (!)
			if (!msg.content.startsWith(process.env.DISCORD_BOT_PREFIX))//Si le message ne commence pas par le prefix du config.json
				return;

			switch (msg.content.substr(1).split(' ')[0]) {
			case 'agenda-version':
				if (process.env.DISCORD_BOT_VERSION != undefined)
					msg.author.send(process.env.DISCORD_BOT_VERSION);
				break;

			case 'agenda-help':
				msg.author.send(Embed.getHelpEmbed());
				break;
			}
		}
	}
});

/**
 * Methode exécutée dès que la commande '/agenda' est effectuée par un utilisateur.
 * - Affiche un menu de selection d'action (Via emojis et grace à BOT_ACTIONS)
 * - Quand une action est selectionnée, sa method conrrespondante est éxécutée
 * @param userId l'id discord de l'utilisateur qui a effectué la commande
 * @param byPassUserHandle annule l'enregistrement de l'utilisateut qu'utilisateur qui utilise le bot
 * (Utile pour commandes pas dispo qui réaffichent le menu)
 */
const onBotCommand = (userId: string, byPassUserHandle = false) => {
	//Recupération de l'utilisateur qui a fais la commande
	client.users.fetch(userId).then((user) => {
		if (handleUser(userId) === -1 && !byPassUserHandle) {
			user.send(Embed.getDefaultEmbed('Hop hop hop attention !', 'Inutile de refaire cette commande une seconde fois, fais plutôt ce que le Bot te dis de faire !'))
				.catch(e => console.error(e));
			return;
		}

		//Envois du message de menu en privé à l'utilisateur
		Embed.getMenuEmbed(BOT_ACTIONS);
		user.send(Embed.getMenuEmbed(BOT_ACTIONS)).then((msg) => {

			//Creation des reactions du menu
			const emojis: string[] = [];
			BOT_ACTIONS.forEach(action => {
				emojis.push(action.emoji);
				msg.react(action.emoji).catch(() => console.info('React on deleted message'));
			});

			//Filtre : seul l'utilisateur peut réagir (evite que les reactions du bot soient prisent en compte)
			// et avec seulement les emojis du menu
			const filter = (reaction: Discord.MessageReaction, reactUser: Discord.User) => {
				return emojis.includes(reaction.emoji.name) &&
					reactUser.id === userId;
			};

			// On attend la reaction de l'utilisateur on prenant le filtre en compte (Max 60 secondes d'attente)
			msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
				//On cherche parmis les actions possible celle qui correspond à cet emoji
				BOT_ACTIONS.forEach(action => {
					if (collected.first()?.emoji.name == action.emoji) {
						//Si cette action possède une fonction valide, on l'execute
						if (action.action) {
							action.action(user);
							msg.delete().catch((e) => console.error(e));
						} else {
							msg.reply(Embed.getDefaultEmbed('Désolé cette commande n\'est pas encore disponible')).catch(e => console.error(e));
							msg.delete().catch((e) => console.error(e));
							// On renvois le menu dans le cas d'une action non valide
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							setTimeout(() => { onBotCommand(userId, true); }, 1000);
						}
					}
				});
			}).catch(() => {
				msg.reply(Embed.getDefaultEmbed('Annulation', 'Temps de réponse trop long')).catch(e => console.error(e));
				msg.delete().catch((e) => console.error(e));
				handleUser(userId, true);
			});
		}).catch(() => { console.error('Impossible d\'envoyer un message privé à cet utilisateur'); });

	}).catch(() => console.error('Utilisateur introuvable ou erreur interne (onBotCommand)'));
};

client.login(process.env.DISCORD_BOT_TOKEN);
