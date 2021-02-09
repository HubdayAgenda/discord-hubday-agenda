require("better-logging")(console);

const Discord = require("discord.js");
const client = new Discord.Client();
const DISCORD_CONFIG = require("../config.json");

const FIREBASE_CONFIG = require("../configFirebase.json");
const Firebase = require("./firebase.js");
const fb = new Firebase(FIREBASE_CONFIG);

const Embed = require("./embed.js");
const embed = new Embed();

const AddForm = require("./addForm");


/**
 * Modules db object {}
 */
let MODULES = null;

/**
 * Télécharge la liste de modules à partir de la db si elle n'est pas encore stockée
 * (Soit normalement une fois au lancement)
 * @return Le contenu des modules
 */
const getModules = async () => {
	if (MODULES === null) {
		const modules = await fb.getDbData("modules");
		console.log("[DB] Modules retrieved : " + Object.keys(modules).length);
		return modules;
	}
	return MODULES;
};


/**
 * Liste des id discords des utilisateurs en train d'utiliser le bot
 */
let USER_LOAD = [];

/**
 * Gère les utilisateurs discord en train d'utiliser le bot.
 * 
 * En cas de soucis de gestion, un utilisateur est noté comme 
 * "plus en train d'utiliser le bot" après 2 mins.
 * 
 * @param id id de l'utilisateur a manager
 * @return -1 si l'utilisateur est déjà managé (soit déjà en train d'utiliser le bot)
 */
const handleUser = (id, remove = false) => {
	if (USER_LOAD.includes(id)) {
		if (remove) {
			console.info("[UserLoad] User unhandled correctly with id : " + id);
			USER_LOAD.splice(USER_LOAD.indexOf(id, 1));
		} else {
			console.info("[UserLoad] User already handled with id : " + id);
			return -1;
		}
	} else {
		USER_LOAD.push(id);
		console.info("[UserLoad] New user handled with id : " + id);
		async () => {
			setTimeout(() => {
				console.warn("[UserLoad] User automatically unhandled with id : " + id + "(timeout)");
				handleUser(id, true);
			}, 120000);
		};
	}
};


/**
 * Actions du bot, choisissable depuis un message de menu (Premier MP du bot après /agenda)
 *  - name : (requis) nom de l'action (sera affiché)
 *  - emoji : (requis) utilisé pour la selection de l'action via un message de menu
 *  - action : (facultatif) si present, envois vers une fonction à éxécuter
 */
const BOT_ACTIONS = [
	{
		"name": "Ajouter un devoir",
		"emoji": "✅",
		"action": new AddForm().startAddForm
	},
	{
		"name": "Modifier un devoir",
		"emoji": "💬",
	},
	{
		"name": "Supprimer un devoir",
		"emoji": "❌",
	},
	{
		"name": "Reporter un bug",
		"emoji": "📣",
		"action": (user) => user.send(
			embed.getDefaultEmbed("Voici ou reporter un bug du bot :", "https://github.com/tjobit/discord-hubday-agenda/issues/new")
		).catch(e => console.error(e))
	}
];


client.on("ready", async () => {

	/**
	 * Enregistrement de la commande /agenda
	 */
	client.api.applications(client.user.id).commands.post({
		data: { name: "agenda", description: "Permet de gérer les devoirs dans l'agenda Discord et Hudbay" }
	});

	/**
	 * Enregistrement listener des commandes
	 */
	client.ws.on("INTERACTION_CREATE", async interaction => {
		(interaction.data.name.toLowerCase() === "agenda") && onBotCommand(interaction.user.id);
	});

	console.log("========================================");
	MODULES = await getModules();
	console.log("========================================");
	console.log("             Bot started !              ");
	console.log("========================================");

});


/**
 * Des que la commande /agenda est exécutée : ouvre le menu et attend la reponse (via reactions)
 * Des que une réactions au menu est réçu, l'action correspondante est éxécutée
 * @param {*} userID 
 */
const onBotCommand = (userId, byPassUserHandle = false) => {
	//Recupération de l'utilisateur qui a fais la commande
	client.users.fetch(userId).then((user) => {
		if (handleUser(userId) === -1 && !byPassUserHandle) {
			user.send(embed.getDefaultEmbed("Hop hop hop attention !", "Inutile de refaire cette commande une seconde fois, fais plutôt ce que le Bot te dis de faire !"))
				.catch(e => console.error(e));
			return;
		}

		//Envois du message de menu en privé à l'utilisateur
		embed.getMenuEmbed(BOT_ACTIONS);
		user.send(embed.getMenuEmbed(BOT_ACTIONS)).then((msg) => {

			//Creation des reactions du menu
			const emojis = [];
			BOT_ACTIONS.forEach(action => {
				emojis.push(action.emoji);
				msg.react(action.emoji);
			});

			//Filtre : seul l'utilisateur peut réagir (evite que les reactions du bot soient prisent en compte) 
			// et avec seulement les emojis du menu
			const filter = (reaction, reactUser) => {
				return emojis.includes(reaction.emoji.name) &&
					reactUser.id === userId;
			};

			// On attend la reaction de l'utilisateur on prenant le filtre en compte (Max 60 secondes d'attente)
			msg.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] }).then(collected => {
				//On cherche parmis les actions possible celle qui correspond à cet emoji
				BOT_ACTIONS.forEach(action => {
					if (collected.first().emoji.name == action.emoji) {
						//Si cette action possède une fonction valide, on l'execute
						if (action.action) {
							action.action(user);
						} else {
							msg.reply(embed.getDefaultEmbed("Désolé cette commande n'est pas encore disponible")).catch(e => console.error(e));
							// On renvois le menu dans le cas d'une action non valide
							setTimeout(() => { onBotCommand(userId, true); }, 1000);
						}
					}
				});
			}).catch(() => {
				msg.reply(embed.getDefaultEmbed("Annulation", "Temps de réponse trop long")).catch(e => console.error(e));
				handleUser(userId, true);
			});

		}).catch(() => { console.error("Impossible d'envoyer un message privé à cet utilisateur"); });

	}).catch(() => console.error("Utilisateur introuvable ou erreur interne (onBotCommand)"));
};

client.login(DISCORD_CONFIG.token);

exports.modules = getModules;









/**
 * Dev ===============================
 */
client.on("message", async msg => {
	if (msg.channel.type === "dm") {
		// msg.author.send(await embed.getMatieresEmbed(["UE 1-1", "UE 1-2"]));
		// console.log(MODULES);
		// const users = await fb.getDbData("users");
		// const groups = [];
		// for (var idnum of Object.keys(users)) {
		// 	var user = users[idnum];

		// 	if(!groups.includes(user.group2)){
		// 		console.log(user.group2);
		// 		groups.push(user.group2);
		// 	}
		// }
		// console.log(groups);
	}

	//On regarde si le message commence bien par le prefix (!)
	// if (!msg.content.startsWith(DISCORD_CONFIG.prefix))//Si le message ne commence pas par le prefix du config.json
	// 	return;

	// switch (msg.content.substr(1).split(" ")[0]) {//Switch sur le premier mot du msg sans le prefix Ex: "!agenda dejfez" donne "agenda"
	// 	case "test":
	// 		// msg.channel.send(embed.getHelpEmbed());
	// 		//getModules();
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

