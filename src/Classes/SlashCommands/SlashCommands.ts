/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as Discord from 'discord.js';
import BotLog from '../BotLog';

export default class SlashCommands {

	static botLog: BotLog = new BotLog('Slash command base');

	static COMMAND_OPTION_TYPE = Object.freeze({
		SUB_COMMAND: 1,
		SUB_COMMAND_GROUP: 2,
		STRING: 3,
		INTEGER: 4,
		BOOLEAN: 5,
		USER: 6,
		CHANNEL: 7,
		ROLE: 8
	});

	/**
	 * Ajoute une slash command sur un serveur
	 * @param guildId id du serveur sur lequel ajouter la commande
	 * @param clientId id du bot
	 * @param botToken token du bot
	 * @param payload commande a ajouter
	 */
	static async addSlashCommand(client: Discord.Client, payload: unknown): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(client as any).api.applications(client.user?.id).commands.post({ data: payload })
			.catch((e: unknown) => this.botLog.error(e));
	}

	/**
	 * Permet d'afficher la liste des slash commands liées au bot
	 * @param clientId id du bot
	 * @param botToken token du bot
	 */
	static async getSlashCommands(client: Discord.Client, guildId: string | null = null): Promise<void> {
		let cmds;
		guildId == null ?
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			cmds = await (client as any).api.applications(client.user?.id).commands.get()
				.catch((e: unknown) => this.botLog.error(e))
			:
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			cmds = await (client as any).api.applications(client.user?.id).guilds(guildId).commands.get()
				.catch((e: unknown) => this.botLog.error(e));

		console.log(cmds);
	}

	/**
	 * Permet de supprimer une slash command liées au bot
	 * @param clientId id du bot
	 * @param commandId Id de la commande à supprimer
	 * @param guildId facultatif, commande de guild (ID)
	 */
	static async deleteSlashCommand(client: Discord.Client, commandId: string, guildId: string | null = null): Promise<void> {
		guildId == null ?
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(client as any).api.applications(client.user?.id).commands(commandId).delete()
				.catch((e: unknown) => this.botLog.error(e))
			:
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(client as any).api.applications(client.user?.id).guilds(guildId).commands(commandId).delete()
				.catch((e: unknown) => this.botLog.error(e));
	}

	/**
	 * Permet de traiter une interaction (commande) reçu par le bot
	 * @param client bot discord
	 * @param interaction interaction reçu
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static processInteraction(client: Discord.Client, interaction: any): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(client as any).api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 2
			}
		})
			.catch((e: unknown) => this.botLog.error(e));
	}
}


