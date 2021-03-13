import * as Discord from 'discord.js';
import BotLog from './Classes/BotLog';

/**
 * Liste des id discords des utilisateurs en train d'utiliser le bot
 */
const USER_LOAD: string[] = [];
const userLoadLog = new BotLog('User load');

/**
 * Gère les utilisateurs discord en train d'utiliser le bot.
 *
 * En cas de soucis de gestion, un utilisateur est noté comme
 * "plus en train d'utiliser le bot" après 2 mins.
 *
 * @param id id de l'utilisateur a manager
 * @return -1 si l'utilisateur est déjà managé (soit déjà en train d'utiliser le bot)
 */
export const handleUser = (user: Discord.User, remove = false): number | void => {
	if (USER_LOAD.includes(user.id)) {
		if (remove) {
			USER_LOAD.splice(USER_LOAD.indexOf(user.id), 1);
			userLoadLog.info(`[${USER_LOAD.length}] Bot user retiré (N'utilise plus le bot) : ` + user.username);
		} else {
			userLoadLog.info(`[${USER_LOAD.length}] Bot user déjà en train d'utiliser le bot: ` + user.username);
			return -1;
		}
	} else if (!remove) {
		USER_LOAD.push(user.id);
		userLoadLog.info(`[${USER_LOAD.length}] Bot user ajouté (Commence à utiliser le bot): ` + user.username);
		async () => {
			setTimeout(() => {
				handleUser(user, true);
				userLoadLog.error(`[${USER_LOAD.length}] Bot user retiré car son temps d'utilisation est trop long (L'utilisteur na pas du être retiré normalement) : ` + user.username);
			}, 300000);
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
