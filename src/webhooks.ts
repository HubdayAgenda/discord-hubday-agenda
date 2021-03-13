import { Webhook, MessageBuilder } from 'discord-webhook-node';
import * as Discord from 'discord.js';
import { getResponse, IemojiAction } from './addForm';
import { getDefaultEmbed } from './embed';
import BotLog from './Classes/BotLog';
import { handleUser } from './userLoad';

/**
 * Lance un formulaire de bug report dans discord et envois le bug sur un webhook
 * @param user Utilisateur qui fais le report
 */
export const sendReportHook = async (user: Discord.User): Promise<void> => {
	const botLog = new BotLog('Bug report webhook', user);

	if (process.env.DISCORD_BUG_REPORT_WEBHOOK_URL === undefined) {
		botLog.error('Webhook setup error');
		return;
	}
	const hook = new Webhook(process.env.DISCORD_BUG_REPORT_WEBHOOK_URL);

	const filter: Discord.CollectorFilter = m => m.author.id === user.id;

	const emojiAction: IemojiAction[] = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];

	const reportBug = await getResponse(
		user,
		botLog,
		getDefaultEmbed('Bug Report', 'Veuillez décrire le problème', 'Répondez directement sous ce message'),
		filter,
		emojiAction
	);

	if(reportBug == -1){
		user.send(getDefaultEmbed('Bug report annulé', 'Si vous retrouvez un bug plus tard n\'hésitez pas à nous prévenir !'));
		botLog.log('Formulaire bug report annulé');
		return;
	}

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

	handleUser(user, true);
};

/**
 * Lance un formulaire de bug report dans discord et envois le bug sur un webhook
 * @param botLog instance de botLog qui contient les logs a envoyer
 */
export const sendErrorsHook = async (botLog: BotLog): Promise<void> => {
	botLog.info('Envois d\'un webhook d\'erreur...');

	if (process.env.DISCORD_ERRORS_REPORT_WEBHOOK_URL === undefined) {
		console.error('Webhook setup error');
		return;
	}
	const hook = new Webhook(process.env.DISCORD_ERRORS_REPORT_WEBHOOK_URL);

	const embedReport = new MessageBuilder()
		.setTitle('Problème détecté ' + (botLog.getUsernameString() ? botLog.getUsernameString() : ''))
		.setDescription('```' + botLog.getLastMessages() + '```')
		.setColor(11524793)
		.setTimestamp();
	try {
		hook.send(embedReport);
	} catch (e) {
		console.error('Impossible d\'envoyer un message avec le web hook de bug report, vérifiez que l\'url du web hook est valide');
	}
};
