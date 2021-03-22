import * as Discord from 'discord.js';
import * as modulesTab from './modulesTab';
import { IemojiAction } from './Classes/AddSubjectForm';
import Subject, { getSubjects } from './Classes/Subject';
import { userLoadCount } from './userLoad';
import User from './Classes/User';
import moment = require('moment');
import config from './config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const momentDurationFormatSetup = require('moment-duration-format');
momentDurationFormatSetup(moment);
/**
 * Création de l'embed pour l'affichage du !help-agenda
 * @return l'embed mis en forme
 */
export const getHelpEmbed = (): Discord.MessageEmbed => {
	const exampleEmbed = new Discord.MessageEmbed()
		.setAuthor('Aide BotAgenda', 'https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png')
		.addFields(
			{ name: 'Utiliser le BotAgenda', value: '/agenda' }
		)
		.setDescription('Le BotAgenda lie les devoirs ajoutés sur Hubday et dans nos salons Discord.')
		.setColor('#afdab9')
		.setFooter('Suivez les instructions une fois la commande effectuée.');
	return exampleEmbed;
};

/**
 * Création de l'embed pour l'affichage du tableau des matières
 * @param userSubjects
 * @return l'embed mis en forme
 */
export const getMatieresEmbed = async (userSubjects: Subject[]): Promise<Discord.MessageEmbed> => {
	const attachment = await modulesTab.getTabImageAttachment(userSubjects);
	const embed = new Discord.MessageEmbed()
		.attachFiles([attachment])
		.setColor('#afdab9')
		.setImage('attachment://image.png')
		.setFooter('Répondez avec le numéro correspondant.')
		.setDescription('Cliquez sur l\'image pour l\'agrandir.')
		.setAuthor('Choisissez une matière :', 'https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png');
	return embed;
};

/**
 * Retourne un embed tout simple avec juste un titre et une description
 * @param titre Le titre de l'embed
 * @param description La description de l'embed
 * @param footer Le footer de l'embed
 * @param color La couleur de l'embed
 * @return l'embed final
 */
export const getDefaultEmbed = (titre: string, description: string | null = null, footer: string | null = null, color = '#afdab9'): Discord.MessageEmbed => {
	const embed = new Discord.MessageEmbed()
		.setAuthor(titre, 'https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png')
		.setColor(color);

	if (description != null)
		embed.setDescription(description);

	if (footer != null)
		embed.setFooter(footer);
	return embed;
};

/**
 * Retourne un embed destiné au questions qui attendent une réponse sous forme de chox via emoji
 * @param titre Le titre de l'embed
 * @param emojiList La liste des emojis possible qui servent de réponse en réaction
 * @param description La description de l'embed
 * @param footer Le footer de l'embed
 * @return l'embed pour cette question
 */
export const getEmojiFormEmbed = (titre: string, emojiList: IemojiAction[], description: string | null = null, footer: string | null = null, color = '#afdab9'): Discord.MessageEmbed => {
	const embed = new Discord.MessageEmbed()
		.setAuthor(titre, 'https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png')
		.setColor(color);
	if (description != null)
		embed.setDescription(description);
	if (footer != null)
		embed.setFooter(footer);

	emojiList.forEach((param: IemojiAction) => {
		embed.addField(param.emoji + '‌‌ ‌‌ ' + param.description, '‌‌ ', true);
	});
	return embed;
};

export const getRuntimeEmbed = async (): Promise<Discord.MessageEmbed> => {
	const uptime = moment.duration(process.uptime(), 'second')
		.format('dd:hh:mm:ss');

	const embed = new Discord.MessageEmbed()
		.setAuthor('Runtime', 'https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png')
		.addField('UpTime', uptime)
		.addField('Subjects count', Object.values(await getSubjects()).length)
		.addField('User count', Object.values(User.USERS_LIST).length)
		.addField('User load', userLoadCount())
		.addField('Bot version', config.bot.version)
		.setColor('#afdab9');

	return embed;
};
