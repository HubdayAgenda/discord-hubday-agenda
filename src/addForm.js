const Embed = require("./embed");

const FIREBASE_CONFIG = require("../configFirebase.json");
const Firebase = require("./firebase.js");
const dataBase = new Firebase(FIREBASE_CONFIG);

const ModulesTab = require("./modulesTab.js");

const index = require("./index.js");
const Utils = require("./utils");
const Devoir = require("./Devoir.js");

class AddForm {

	static async startAddForm(user) {
		this.logForm(user, "== Add form started ==");
		const GROUPNUM = 2;



		// Retrieve user from DB
		// ==============================================================
		const hubdayUser = await dataBase.getDbDataWithFilter("users", "discordId", user.id);
		if (Object.keys(hubdayUser).length == 0) {
			console.warn("User not found");
			return;
		}
		const group = hubdayUser[Object.keys(hubdayUser)[0]][`group${GROUPNUM}`];
		const semester = group[1];//2em char de la string group
		// ==============================================================



		// Ask for module		
		// ==============================================================
		const { tabMod, matEmbed } = await this.getUeTab(semester, group);

		let filter = m => m.author.id === user.id
			&& !Number.isNaN(parseInt(m.content))
			&& (parseInt(m.content) < Object.keys(tabMod).length + 1)
			&& (parseInt(m.content) > 0);

		const numModule = await this.getResponse(user, matEmbed, filter);
		if (numModule === null) { console.warn("Get response error (Timeout or Exception)"); return; }

		const _MODULE = tabMod[numModule - 1];

		this.logForm(user, ` 1) module num : ${numModule}`);
		// ==============================================================



		//Ask for labels
		// ==============================================================
		filter = m => m.author.id === user.id;
		const labelEmbed = Embed.getDefaultEmbed(
			"Description du devoir de " + (_MODULE.shortName ? _MODULE.shortName : _MODULE.name),
			"Vous pouvez indiquer plusieurs tâches à effectuer",
			"Répondez sous la forme :\n tache 1 | tache 2 | tache 3 | ..."
		);

		const labelResponse = await this.getResponse(user, labelEmbed, filter);
		if (labelResponse === null) { console.warn("Get response error (Timeout or Exception)"); return; }

		const _LABELS = [];
		if (labelResponse.includes("|")) {
			labelResponse.split("|").forEach(element => {
				_LABELS.push(element.trim());
			});
		}
		else {
			_LABELS.push(labelResponse.trim());
		}

		this.logForm(user, ` 2) labels : ${_LABELS}`);
		// ==============================================================



		// Ask for date
		// ==============================================================
		let dateEmbed = Embed.getDefaultEmbed(
			"Date de remise du devoir",
			"Ajoutez la date sous la forme JJ/MM"
		);
		let valid = false;
		let _DATE;
		while (!valid) {
			const dateResponse = await this.getResponse(user, dateEmbed, filter = m => m.author.id === user.id);
			if (dateResponse === null) { console.warn("Get response error (Timeout or Exception)"); return; }

			if (Utils.dateValidFormat(dateResponse) && Utils.dateValid(dateResponse)) {
				valid = true;
				_DATE = dateResponse;
			} else {
				dateEmbed = Embed.getDefaultEmbed(
					"Date invalide",
					"Ajoutez la date sous la forme JJ/MM"
				);
			}
		}

		this.logForm(user, ` 3) date : ${_DATE}`);
		// ==============================================================



		// Ask for group
		// ==============================================================
		let emojiAction = [
			{ "emoji": "⏏️", "value": 1, "description": "Ajouter le devoir pour toute la classe" },
			{ "emoji": "🔽", "value": 2, "description": "Ajouter le devoir uniquement pour votre groupe de TP" },
		];

		const groupResponse = await this.getEmojisResponse(
			user,
			emojiAction,
			Embed.getEmojiFormEmbed("Classe ou groupe de TP ?", emojiAction, null, "Réagissez avec l'émoji correspondant à l'action souhaitée.")
		);
		if (groupResponse === null) { console.warn("Get response error (Timeout or Exception)"); return; }

		const _GROUP = groupResponse == 1 ? "entier" : hubdayUser[Object.keys(hubdayUser)[0]][`subgroup${GROUPNUM}`];

		this.logForm(user, ` 4) group : ${_GROUP}`);
		// ==============================================================


		
		// Ask for delivery
		// ==============================================================
		emojiAction = [
			{ "emoji": "❌", "value": -1, "description": "Ne pas spécifier" },
		];

		const deliveryResponse = await this.getResponse(
			user,
			Embed.getEmojiFormEmbed("Intitulé de la remise ? (facultatif)", emojiAction, "Vous pouvez indiquer le nom de la remise", "Réagissez avec l'émoji pour passer ou répondez."),
			filter = m => m.author.id === user.id,
			emojiAction,
		);
		if (deliveryResponse === null) { console.warn("Get response error (Timeout or Exception)"); return; }

		const _DELIVERY = deliveryResponse == -1 ? null : deliveryResponse;

		this.logForm(user, ` 5) delivery : ${_DELIVERY}`);
		// ==============================================================



		// Ask for link
		// ==============================================================
		emojiAction = [
			{ "emoji": "❌", "value": -1, "description": "Ne pas spécifier" },
		];
		valid = false;
		let _LINK = null;
		while(!valid){
			const linkResponse = await this.getResponse(
				user,
				Embed.getEmojiFormEmbed("Lien de la remise ? (facultatif)", emojiAction, null, "Réagissez avec l'émoji pour passer ou répondez avec un lien."),
				filter = m => m.author.id === user.id,
				emojiAction
			);
			if (linkResponse === null) { console.warn("Get response error (Timeout or Exception)"); return; }		
			if(linkResponse == -1){
				valid = true;
				_LINK = null;
			}else if(Utils.validURL(linkResponse)){
				_LINK = linkResponse;
				valid = true;
			}else{
				user.send(Embed.getDefaultEmbed("Répondez avec un lien moodle uniquement !"));
			}
		}

		this.logForm(user, ` 6) link : ${_LINK}`);
		// ==============================================================



		// Ask for grade
		// ==============================================================
		emojiAction = [
			{ "emoji": "📈", "value": true, "description": "Devoir noté" },
			{ "emoji": "📉", "value": false, "description": "Devoir non noté" },
			{ "emoji": "❌", "value": -1, "description": "Ne pas spécifier" },
		];

		const gradeResponse = await this.getEmojisResponse(
			user,
			emojiAction,
			Embed.getEmojiFormEmbed("Le devoir est-il noté ? (facultatif)", emojiAction, null, "Réagissez avec l'émoji correspondant à l'action souhaitée.")
		);
		if (gradeResponse === null) { console.warn("Get response error (Timeout or Exception)"); return; }

		const _GRADE = (gradeResponse === -1 ? null : gradeResponse);

		this.logForm(user, ` 7) grade : ${_GRADE}`);
		// ==============================================================



		// const devoir = new Devoir(_MODULE, _LABELS, _DATE, _GROUP);

		this.logForm(user, "== Add form ended ==");
		index.handleUser(user.id, true);
		user.send("done");
	}

	static async getResponse(user, messageContent, filter, emojiActions = null) {
		return new Promise(
			function (resolve) {
				user.send(messageContent).then((msg) => {
					if (emojiActions !== null) {
						emojiActions.forEach(element => {
							msg.react(element.emoji).catch(() => console.info("React on deleted message"));
						});

						const filter = (reaction, reactUser) => { return reactUser.id === user.id; };
						msg.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] }).then(collected => {
							emojiActions.forEach(action => {
								if (action.emoji == collected.first().emoji.name) {
									resolve(action.value);
								}
							});
							resolve(null);
						}).catch(() => {});
					}

					msg.channel.awaitMessages(filter, {
						max: 1,
						time: 60000,
						errors: ["time"]
					}).then(answer => {
						resolve(answer.first().content);
					}).catch(() => {
						user.send(Embed.getDefaultEmbed("Annulation", "Temps de réponse trop long")).catch(e => console.error(e));
						msg.delete().catch((e) => console.error(e));
						index.handleUser(user.id, true);
						resolve(null);
					});
				}).catch(e => console.error(e));
			}
		);
	}

	static async getEmojisResponse(user, emojiActions, messageContent) {
		return new Promise(
			function (resolve) {
				user.send(messageContent).then((msg) => {
					emojiActions.forEach(element => {
						msg.react(element.emoji).catch(() => console.info("React on deleted message"));
					});

					const filter = (reaction, reactUser) => { return reactUser.id === user.id; };
					msg.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] }).then(collected => {
						emojiActions.forEach(action => {
							if (action.emoji == collected.first().emoji.name) {
								resolve(action.value);
							}
						});
						resolve(null);
					}).catch(() => {
						user.send(Embed.getDefaultEmbed("Annulation", "Temps de réponse trop long")).catch(e => console.error(e));
						msg.delete().catch((e) => console.error(e));
						index.handleUser(user.id, true);
						resolve(null);
					});
				}).catch(e => console.error(e));
			}
		);
	}

	static async getUeTab(semester, group) {
		const sem = parseInt(semester);

		const ueTab = [];
		if (Number.isNaN(sem)) {
			ueTab.push("Parcours Robotique S4");
		} else {
			if (group.length === 3) {
				if (sem === 3) {
					// S3A S3B S3C S3D
					ueTab.push("UE 3-1");
					ueTab.push("UE 3-2");
					ueTab.push("UE 3-3");
				} else {
					// S1A S1B S1C S1D S2A S2B S2C S2D
					ueTab.push(`UE ${sem}-1`);
					ueTab.push(`UE ${sem}-2`);
				}
			} else {
				// S4p1A S4p2B S4p2C S4p2D
				ueTab.push("UE 4-1");
				ueTab.push("UE 4-2");
			}
		}

		const matEmbed = await Embed.getMatieresEmbed(ueTab, semester);

		const modulesTab = new ModulesTab(await index.modules());

		const tabMod = [];
		ueTab.forEach(element => {
			modulesTab.getModulesByUE(element).forEach(element => {
				tabMod.push(element);
			});
		});

		return { tabMod, matEmbed };
	}

	static logForm(user, log) {
		console.info(`[AddForm - ${user.username}]    ${log}`);
	}
}

module.exports = AddForm;
