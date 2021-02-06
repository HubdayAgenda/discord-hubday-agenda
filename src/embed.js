const Discord = require("discord.js");
const modulesTab = require("./modulesTab");

/**
 * Création de l'embed pour l'affichage du !help-agenda
 * @return l'embed mis en forme
 */
const getHelpEmbed = () => {
	const exampleEmbed = new Discord.MessageEmbed()
		.setAuthor("Aide BotAgenda", "https://www.hubday.fr/favicon/apple-touch-icon.png")
		.addFields(
			{ name: "Utiliser le BotAgenda", value: "/agenda" }
		)
		.setDescription("Le BotAgenda lie les devoirs ajoutés sur Hubday et dans nos salons Discord.")
		.setColor("#afdab9")
		.setFooter("Suivez les instructions une fois la commande effectuée.");
	return exampleEmbed;
};

/**
 * Création de l'embed pour l'affichage du tableau des matières
 * @return l'embed mis en forme
 */
const getMatieresEmbed = async (ue) => {
	const attachment = await modulesTab.getTabImageAttachment(ue);
	const embed = new Discord.MessageEmbed()
		.attachFiles(attachment)
		.setColor("#afdab9")
		.setImage("attachment://image.png")
		.setFooter("Repondez avec le numéro correspondant.")
		.setDescription("Cliquez sur l'image pour l'agrandir.")
		.setAuthor("Choisissez une matière :", "https://www.hubday.fr/favicon/apple-touch-icon.png");
	return embed;
};

const getMenuEmbed = (BOT_ACTIONS) => {
	const embed = new Discord.MessageEmbed()
		.setAuthor("Menu des commandes", "https://www.hubday.fr/favicon/apple-touch-icon.png")
		.setColor("#afdab9")
		.setFooter("Régissez avec l'émoji correspondant à l'action souhaitée.");

	BOT_ACTIONS.forEach(action => {
		embed.addField(action.action ? action.name : "~~"+action.name+"~~", action.emoji);
	});

	return embed;
};

const getDefaultEmbed = (titre, description = null) => {
	const embed = new Discord.MessageEmbed()
		.setAuthor(titre, "https://www.hubday.fr/favicon/apple-touch-icon.png")
		.setColor("#afdab9");
        
	if(description != null)
		embed.setDescription(description);
	return embed;
};

exports.getDefaultEmbed = getDefaultEmbed;
exports.getHelpEmbed = getHelpEmbed;
exports.getMatieresEmbed = getMatieresEmbed;
exports.getMenuEmbed = getMenuEmbed;