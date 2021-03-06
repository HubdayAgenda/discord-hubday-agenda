import { Webhook, MessageBuilder } from 'discord-webhook-node';
import * as Discord from 'discord.js';
import { getResponse } from './addForm';
import { getDefaultEmbed } from './embed';
import { handleUser } from './index';
import { BotLog } from './Classes_Interfaces/BotLog';

/**
 * Lance un formulaire de bug report dans discord et envois le bug sur un webhook
 * @param user Utilisateur qui fais le report
 */
export const sendReportHook = async (user: Discord.User): Promise<void> => {
	const botLog = new BotLog('Bug report webhook', user);

	if(process.env.DISCORD_BUG_REPORT_WEBHOOK_URL === undefined){
		botLog.error('Webhook setup error');
		return;
	}
	const hook = new Webhook(process.env.DISCORD_BUG_REPORT_WEBHOOK_URL);

	const filter : Discord.CollectorFilter = m  => m.author.id === user.id;
	const reportBug = await getResponse(user, botLog, getDefaultEmbed('Bug Report', 'Veuillez décrire le problème', 'Répondez directement sous ce message'), filter);

	if (reportBug == null)
		return;

	const embedReport = new MessageBuilder()
		.setTitle('Report de bug')
		.setDescription(reportBug.toString())
		.setColor(11524793)
		.setAuthor(user.username, 'https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png')
		.setTimestamp();

	try {
		hook.send(embedReport);
	} catch (e) {
		botLog.error('Impossible d\'envoyer un message avec le web hook de bug report, vérifiez que l\'url du web hook est valide');
	}

	user.send(getDefaultEmbed('Bug Report', 'Votre bug report a bien été enregistré', 'Vous participez à rendre ce bot meilleur, merci'));

	handleUser(user.id, true);
};
