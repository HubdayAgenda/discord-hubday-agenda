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
	{
		'name': 'Modifier un devoir',
		'emoji': '💬',
		'action': null
	},
	{
		'name': 'Supprimer un devoir',
		'emoji': '❌',
		'action': null
	},
	{
		'name': 'Reporter un bug',
		'emoji': '📣',
		'action': (user: Discord.User): void => {
			user.send(
				Embed.getDefaultEmbed('Voici ou reporter un bug du bot :', 'https://github.com/tjobit/discord-hubday-agenda/issues/new')
			).catch(e => console.error(e));
			handleUser(user.id, true);
		}
	}
];


client.on('ready', async () => {
	// /**
	//  * Enregistrement de la commande /agenda
	//  */
	// client.api.applications(client.user?.id).commands.post({
	// 	data: { name: "agenda", description: "Permet de gérer les devoirs dans l'agenda Discord et Hudbay" }
	// });

	// /**
	//  * Enregistrement listener des commandes
	//  */
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


/**
 * Des que la commande /agenda est exécutée : ouvre le menu et attend la reponse (via reactions)
 * Des que une réactions au menu est réçu, l'action correspondante est éxécutée
 * @param {*} userID
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









































/**
 * Dev ====================================================================================================================
 */
client.on('message', msg => {
	if (msg.channel.type === 'dm') {

		// if (msg.author.id !== client.user.id) {
		// 	onBotCommand(msg.author.id);
		// }
		if (msg.author.id !== client.user?.id && !USER_LOAD.includes(msg.author.id)) {
			// msg.author.send(Embed.getHelpEmbed());

			onBotCommand(msg.author.id);

			// handleUser(msg.author.id);
			// AddForm.startAddForm(msg.author);

			// const subject = {
			// 	"alias": [
			// 		"M1202 Algèbre linéaire"
			// 	],
			// 	"color": "#2980b9",
			// 	"displayId": "M1202",
			// 	"displayName": "Algèbre linéaire",
			// 	"group": [
			// 		"S1"
			// 	],
			// 	"icon": "algebre-lineaire",
			// 	"name": "M1202 Algèbre linéaire",
			// 	"shortName": "",
			// 	"ue": "UE 1-2"
			// };

			// msg.author.send(
			// 	new Homework(
			// 		subject,
			// 		[
			// 			"Exerice pages 16 à 18",
			// 			"Envoyer les réponses sur moodle",
			// 			"Manger des patates"
			// 		],
			// 		"2021-03-10",
			// 		"entier",
			// 		"Demander a Mr Fossé pour la remise",
			// 		"https://moodle1.u-bordeaux.fr/",
			// 		true,
			// 		null
			// 	).getEmbed()
			// );
		}

		// let tab = [];
		// const users = await dataBase.getDbData("users");

		// for (let idnum of Object.keys(users)) {

		// 	let user = users[idnum];
		// 	if (user.group2 === "roboticS4")
		// 		console.log(user);
		// 	// if(user.options[0] = )
		// 	// // if( !tab.includes(user.group1))
		// 	// // 	tab.push(user.group1);
		// 	// // if( !tab.includes(user.group2))
		// 	// // 	tab.push(user.group2);
		// }
		// tab.forEach(element => {
		// 	console.log(element);
		// });


		// const agenda = await dataBase.getDbData("agenda");
		// console.log(agenda["S2A"]);

	}

	//On regarde si le message commence bien par le prefix (!)
	// if (!msg.content.startsWith(DISCORD_CONFIG.prefix))//Si le message ne commence pas par le prefix du config.json
	// 	return;

	// switch (msg.content.substr(1).split(" ")[0]) {//Switch sur le premier mot du msg sans le prefix Ex: "!agenda dejfez" donne "agenda"
	// 	case "test":
	// 		// msg.channel.send(Embed.getHelpEmbed());
	// 		//getSubjects();
	// 		// console.log(msg.author.id);
	// 		//console.log(await fb.getDbDataWithFilter("users", "discordId", msg.author.id))
	// 		const users = await fb.getDbData("users");
	// 		for (var idnum of Object.keys(users)) {
	// 			var user = users[idnum];
	// 			if (user.discordId === "") console.log(user.displayName, user.group2);
	// 		}
	// 		break;
	// }
});

