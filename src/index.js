/* eslint-disable */
// require("better-logging")(console);

const Discord = require("discord.js");
const Firebase = require("./firebase.js");
const client = new Discord.Client();
const DISCORD_CONFIG = require("../config.json");
const FIREBASE_CONFIG = require("../configFirebase.json");

const embed = require("./embed");
const addForm = require("./addForm");

const fb = new Firebase(FIREBASE_CONFIG);

async function getModules() {
	const modules = await fb.getDbData("modules");
	console.log(Object.keys(modules).length);
	return modules;
}

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
		"action": addForm.startAddForm
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


client.on("ready", () => {

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
		(interaction.data.name.toLowerCase() === "agenda") && onBotCommand(interaction);
	});

	console.log("========================================");
	console.log("             Bot started !              ");
	console.log("========================================");

});


/**
 * Des que la commande /agenda est exécutée : ouvre le menu et attend la reponse (via reactions)
 * Des que une réactions au menu est réçu, l'action correspondante est éxécutée
 * @param {*} interaction 
 */
const onBotCommand = (interaction) => {
	console.log(`/agenda received : ${interaction.member.user.username}`);
	//Recupération de l'utilisateur qui a fais la commande
	client.users.fetch(interaction.member.user.id).then((user) => {
		//Envois du message de menu en privé à l'utilisateur
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
					reactUser.id === interaction.member.user.id;
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
							setTimeout(() => { onBotCommand(interaction); }, 1000);
						}
					}
				});
			}).catch(() => {
				msg.reply(embed.getDefaultEmbed("Annulation", "Temps de réponse trop long")).catch(e => console.error(e));
			});

		}).catch(() => { console.error("Impossible d'envoyer un message privé à cet utilisateur"); });

	}).catch(() => console.error("Utilisateur introuvable"));
};

client.login(DISCORD_CONFIG.token);






/**
 * Dev ===============================
 */
client.on("message", async msg => {
	// if (msg.channel.type === "dm") {
	// 	msg.author.send(await embed.getMatieresEmbed(["UE 1-1", "UE 1-2"]));
	// }

	//On regarde si le message commence bien par le prefix (!)
	if (!msg.content.startsWith(DISCORD_CONFIG.prefix))//Si le message ne commence pas par le prefix du config.json
		return;

	switch (msg.content.substr(1).split(" ")[0]) {//Switch sur le premier mot du msg sans le prefix Ex: "!agenda dejfez" donne "agenda"
		case "test":
			// msg.channel.send(embed.getHelpEmbed());
			//getModules();
			// console.log(msg.author.id);
			//console.log(await fb.getDbDataWithFilter("users", "discordId", msg.author.id))
			const users = await fb.getDbData("users")
			for (var idnum of Object.keys(users)) {
				var user = users[idnum];
				if (user.discordId === "") console.log(user.displayName, user.group2)
			}
			break;
	}
});

