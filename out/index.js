"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_ACTIONS = exports.isUserHandled = exports.handleUser = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
require('better-logging')(console);
const Discord = require("discord.js");
const client = new Discord.Client();
const DISCORD_CONFIG = require('../config.json');
const Embed = require("./embed");
const AddForm = require("./addForm");
// import { Homework } from './Classes_Interfaces/Homework';
/**
 * Liste des id discords des utilisateurs en train d'utiliser le bot
 */
const USER_LOAD = [];
/**
 * Gère les utilisateurs discord en train d'utiliser le bot.
 *
 * En cas de soucis de gestion, un utilisateur est noté comme
 * "plus en train d'utiliser le bot" après 2 mins.
 *
 * @param id id de l'utilisateur a manager
 * @return -1 si l'utilisateur est déjà managé (soit déjà en train d'utiliser le bot)
 */
exports.handleUser = (id, remove = false) => {
    if (USER_LOAD.includes(id)) {
        if (remove) {
            USER_LOAD.splice(USER_LOAD.indexOf(id), 1);
            console.info(`[UserLoad : ${USER_LOAD.length}] User unhandled correctly with id : ` + id);
        }
        else {
            console.info(`[UserLoad : ${USER_LOAD.length}] User already handled with id : ` + id);
            return -1;
        }
    }
    else if (!remove) {
        USER_LOAD.push(id);
        console.info(`[UserLoad : ${USER_LOAD.length}] New user handled with id : ` + id);
        () => __awaiter(void 0, void 0, void 0, function* () {
            setTimeout(() => {
                exports.handleUser(id, true);
                console.warn(`[UserLoad : ${USER_LOAD.length}] User automatically unhandled with id : ` + id + '(timeout)');
            }, 120000);
        });
    }
};
/**
 *
 * @param id l'id de l'utilisateur a rechercher
 * @return vrai si l'utilisateur est enregistré
 */
exports.isUserHandled = (id) => {
    return USER_LOAD.includes(id);
};
/**
 * Actions du bot, choisissable depuis un message de menu (Premier MP du bot après /agenda)
 *  - name : (requis) nom de l'action (sera affiché)
 *  - emoji : (requis) utilisé pour la selection de l'action via un message de menu
 *  - action : (facultatif) si present, envois vers une fonction à éxécuter
 */
exports.BOT_ACTIONS = [
    {
        'name': 'Ajouter un devoir',
        'emoji': '✅',
        'action': (user) => AddForm.startAddForm(user)
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
        'action': (user) => {
            user.send(Embed.getDefaultEmbed('Voici ou reporter un bug du bot :', 'https://github.com/tjobit/discord-hubday-agenda/issues/new')).catch(e => console.error(e));
            exports.handleUser(user.id, true);
        }
    }
];
client.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
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
    const status = () => __awaiter(void 0, void 0, void 0, function* () {
        setTimeout(() => {
            var _a;
            (_a = client.user) === null || _a === void 0 ? void 0 : _a.setActivity('/agenda');
            setTimeout(() => {
                var _a;
                (_a = client.user) === null || _a === void 0 ? void 0 : _a.setActivity('hubday.fr', { type: 'WATCHING' });
                status();
            }, 20000);
        }, 20000);
    });
    status();
}));
/**
 * Des que la commande /agenda est exécutée : ouvre le menu et attend la reponse (via reactions)
 * Des que une réactions au menu est réçu, l'action correspondante est éxécutée
 * @param {*} userID
 */
const onBotCommand = (userId, byPassUserHandle = false) => {
    //Recupération de l'utilisateur qui a fais la commande
    client.users.fetch(userId).then((user) => {
        if (exports.handleUser(userId) === -1 && !byPassUserHandle) {
            user.send(Embed.getDefaultEmbed('Hop hop hop attention !', 'Inutile de refaire cette commande une seconde fois, fais plutôt ce que le Bot te dis de faire !'))
                .catch(e => console.error(e));
            return;
        }
        //Envois du message de menu en privé à l'utilisateur
        Embed.getMenuEmbed(exports.BOT_ACTIONS);
        user.send(Embed.getMenuEmbed(exports.BOT_ACTIONS)).then((msg) => {
            //Creation des reactions du menu
            const emojis = [];
            exports.BOT_ACTIONS.forEach(action => {
                emojis.push(action.emoji);
                msg.react(action.emoji).catch(() => console.info('React on deleted message'));
            });
            //Filtre : seul l'utilisateur peut réagir (evite que les reactions du bot soient prisent en compte)
            // et avec seulement les emojis du menu
            const filter = (reaction, reactUser) => {
                return emojis.includes(reaction.emoji.name) &&
                    reactUser.id === userId;
            };
            // On attend la reaction de l'utilisateur on prenant le filtre en compte (Max 60 secondes d'attente)
            msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
                //On cherche parmis les actions possible celle qui correspond à cet emoji
                exports.BOT_ACTIONS.forEach(action => {
                    var _a;
                    if (((_a = collected.first()) === null || _a === void 0 ? void 0 : _a.emoji.name) == action.emoji) {
                        //Si cette action possède une fonction valide, on l'execute
                        if (action.action) {
                            action.action(user);
                            msg.delete().catch((e) => console.error(e));
                        }
                        else {
                            msg.reply(Embed.getDefaultEmbed('Désolé cette commande n\'est pas encore disponible')).catch(e => console.error(e));
                            msg.delete().catch((e) => console.error(e));
                            // On renvois le menu dans le cas d'une action non valide
                            setTimeout(() => { onBotCommand(userId, true); }, 1000);
                        }
                    }
                });
            }).catch(() => {
                msg.reply(Embed.getDefaultEmbed('Annulation', 'Temps de réponse trop long')).catch(e => console.error(e));
                msg.delete().catch((e) => console.error(e));
                exports.handleUser(userId, true);
            });
        }).catch(() => { console.error('Impossible d\'envoyer un message privé à cet utilisateur'); });
    }).catch(() => console.error('Utilisateur introuvable ou erreur interne (onBotCommand)'));
};
client.login(DISCORD_CONFIG.token);
/**
 * Dev ====================================================================================================================
 */
client.on('message', msg => {
    var _a;
    if (msg.channel.type === 'dm') {
        // if (msg.author.id !== client.user.id) {
        // 	onBotCommand(msg.author.id);
        // }
        if (msg.author.id !== ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id) && !USER_LOAD.includes(msg.author.id)) {
            // msg.author.send(Embed.getHelpEmbed());
            exports.handleUser(msg.author.id);
            AddForm.startAddForm(msg.author);
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
//# sourceMappingURL=index.js.map