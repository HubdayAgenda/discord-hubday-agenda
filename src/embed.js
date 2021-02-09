const Discord = require("discord.js");
const ModulesTab = require("./modulesTab");
const index = require("./index");

class Embeds {
	/**
	 * Création de l'embed pour l'affichage du !help-agenda
	 * @return l'embed mis en forme
	 */
	getHelpEmbed() {
		const exampleEmbed = new Discord.MessageEmbed()
			.setAuthor("Aide BotAgenda", "https://www.hubday.fr/favicon/apple-touch-icon.png")
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
	 * @param ue Un tableau comprenant les ue à prendre en compte
	 * @return l'embed mis en forme
	 */
	async getMatieresEmbed(ue, semester) {
		const attachment = await new ModulesTab(await index.modules()).getTabImageAttachment(ue);
		const embed = new Discord.MessageEmbed()
			.attachFiles(attachment)
			.setColor("#afdab9")
			.setImage("attachment://image.png")
			.setFooter("Repondez avec le numéro correspondant.")
			.setDescription("Cliquez sur l'image pour l'agrandir.")
			.setAuthor(`Choisissez une matière du semestre ${semester} :`, "https://www.hubday.fr/favicon/apple-touch-icon.png");
		return embed;
	}

	/**
	 * Création de l'embed pour l'affichage du menu des commandes
	 * @param BOT_ACTIONS JSON contenant les emoji, les noms etc correspondant aux commandes
	 * @return l'embed mis en forme
	 */
	getMenuEmbed(BOT_ACTIONS) {
		const embed = new Discord.MessageEmbed()
			.setAuthor("Menu des commandes", "https://www.hubday.fr/favicon/apple-touch-icon.png")
			.setColor("#afdab9")
			.setFooter("Régissez avec l'émoji correspondant à l'action souhaitée.");

		BOT_ACTIONS.forEach(action => {
			embed.addField(action.action ? action.name : "~~" + action.name + "~~", action.emoji);
		});

		return embed;
	}

	/**
	 * Retourne un embed tout simple avec juste un titre et une description
	 * @param titre Le titre de l'embed 
	 * @param description La description de l'embed (facultatif)
	 */
	getDefaultEmbed(titre, description = null) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(titre, "https://www.hubday.fr/favicon/apple-touch-icon.png")
			.setColor("#afdab9");

		if (description != null)
			embed.setDescription(description);
		return embed;
	}
}

module.exports = Embeds;