import * as Discord from 'discord.js';
import * as index from './index';
import * as modulesTab from './modulesTab';
import { IemojiAction } from './addForm';

/**
 * Création de l'embed pour l'affichage du !help-agenda
 * @return l'embed mis en forme
 */
export const getHelpEmbed = () => {
	const exampleEmbed = new Discord.MessageEmbed()
		.setAuthor("Aide BotAgenda", "https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png")
		.addFields(
			{ name: "Utiliser le BotAgenda", value: "/agenda" }
		)
		.setDescription("Le BotAgenda lie les devoirs ajoutés sur Hubday et dans nos salons Discord.")
		.setColor("#afdab9")
		.setFooter("Suivez les instructions une fois la commande effectuée.");
	return exampleEmbed;
}

/**
 * Création de l'embed pour l'affichage du tableau des matières
 * @param userSubjects
 * @return l'embed mis en forme
 */
export const getMatieresEmbed = async (userSubjects: any) => {
	const attachment = await modulesTab.getTabImageAttachment(userSubjects);
	const embed = new Discord.MessageEmbed()
		.attachFiles([attachment])
		.setColor("#afdab9")
		.setImage("attachment://image.png")
		.setFooter("Répondez avec le numéro correspondant.")
		.setDescription("Cliquez sur l'image pour l'agrandir.")
		.setAuthor("Choisissez une matière :", "https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png");
	return embed;
}

/**
 * Création de l'embed pour l'affichage du menu des commandes
 * @param BOT_ACTIONS JSON contenant les emoji, les noms etc correspondant aux commandes
 * @return l'embed mis en forme
 */
export const getMenuEmbed = (BOT_ACTIONS: index.IbotAction[]) => {
	const embed = new Discord.MessageEmbed()
		.setAuthor("Menu des commandes", "https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png")
		.setColor("#afdab9")
		.setFooter("Réagissez avec l'émoji correspondant à l'action souhaitée.");

	BOT_ACTIONS.forEach((action: index.IbotAction) => {
		embed.addField(action.action ? action.name : "~~" + action.name + "~~", action.emoji);
	});

	return embed;
}


/**
 * Retourne un embed tout simple avec juste un titre et une description
 * @param titre Le titre de l'embed 
 * @param description La description de l'embed (facultatif)
 */
export const getDefaultEmbed = (titre: string, description: string | null = null, footer = null, color = "#afdab9") => {
	const embed = new Discord.MessageEmbed()
		.setAuthor(titre, "https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png")
		.setColor(color);

	if (description != null)
		embed.setDescription(description);

	if (footer != null)
		embed.setFooter(footer);
	return embed;
}

export const getEmojiFormEmbed = (titre: string, emojiList: IemojiAction[], description: string | null = null, footer = null) => {
	const embed = new Discord.MessageEmbed()
		.setAuthor(titre, "https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png")
		.setColor("#afdab9");
	if (description != null)
		embed.setDescription(description);
	if (footer != null)
		embed.setFooter(footer);

	emojiList.forEach((param: IemojiAction) => {
		embed.addField(param.emoji + "‌‌ ‌‌ " + param.description, "‌‌ ", true);
	});
	return embed;
}
