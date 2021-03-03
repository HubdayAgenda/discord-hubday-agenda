import * as Embed from './embed';
import * as fireBase from './firebase';
import * as Utils from './utils';
import { handleUser, isUserHandled } from './index';
import { Homework } from './Classes_Interfaces/Homework';
import { ISubject, getSubjects } from './Classes_Interfaces/Subject';
import * as Discord from 'discord.js';

export interface IemojiAction {
	emoji: string,
	value: number | boolean | null,
	description: string
}

/**
 * Contient l'entièreté des questions nécéssaires à la création d'un devoir
 * A la fin du formulaire un nouveau devoir est créé
 * @param user l'utilisateur concerné par le formulaire
 */
export const startAddForm = async (user: Discord.User): Promise<void> => {
	logForm(user, '== Add form started ==');
	const GROUPNUM = 2;


	// Retrieve user from DB
	// ==============================================================
	const hubdayUserResults = await fireBase.getDbDataWithFilter('users', 'discordId', user.id);
	const hubdayUser = hubdayUserResults[Object.keys(hubdayUserResults)[0]];
	if (Object.keys(hubdayUser).length == 0) {
		console.warn('User not found');
		return;
	}
	const group = hubdayUser[`group${GROUPNUM}`];
	const options = hubdayUser['options'] !== undefined ? hubdayUser['options'] : [];
	// ==============================================================

	const userSubjects = await getUserSubjects(group, options);
	const matEmbed = await Embed.getMatieresEmbed(userSubjects);

	// Ask for module
	// ==============================================================
	let filter: Discord.CollectorFilter = m => m.author.id === user.id
		&& !Number.isNaN(parseInt(m.content))
		&& (parseInt(m.content) < Object.keys(userSubjects).length + 1)
		&& (parseInt(m.content) > 0);

	const numModule: number | null = await getResponse(user, matEmbed, filter);
	if (numModule === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	const _SUBJECT = userSubjects[numModule - 1];

	logForm(user, ` 1) subjectId : ${numModule}`);
	// ==============================================================



	//Ask for labels
	// ==============================================================
	filter = m => m.author.id === user.id;
	const labelEmbed = Embed.getDefaultEmbed(
		`Nouveau devoir pour le cours de ${_SUBJECT.displayId} - ${_SUBJECT.displayName}`,
		'Veuillez indiquer la liste des tâches à effectuer pour ce devoir',
		'Répondez sous la forme :\n tâche 1 | tâche 2 | tâche 3 | ...',
		_SUBJECT.color,
	);

	const labelResponse = await getResponse(user, labelEmbed, filter);
	if (labelResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	const _TASKS = [];
	if (labelResponse.includes('|')) {
		labelResponse.split('|').forEach((element: string) => {
			_TASKS.push(element.trim());
		});
	}
	else {
		_TASKS.push(labelResponse.trim());
	}

	logForm(user, ` 2) tasks : ${_TASKS}`);
	// ==============================================================



	// Ask for date
	// ==============================================================
	let dateEmbed = Embed.getDefaultEmbed(
		'Échéance du devoir',
		'Indiquer la date sous la forme JJ/MM/AAAA',
		null,
		_SUBJECT.color
	);
	let valid = false;
	let _DATE = 'error-date';
	while (!valid) {
		const dateResponse = await getResponse(user, dateEmbed, filter = m => m.author.id === user.id);
		if (dateResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

		const date = Utils.dateValid(dateResponse);

		if (date != null) {
			valid = true;
			_DATE = Utils.convertDateIso(date);
		} else {
			dateEmbed = Embed.getDefaultEmbed(
				'Date invalide',
				'Ajoutez la date sous la forme JJ/MM/AAAA',
				null,
				_SUBJECT.color
			);
		}
	}

	logForm(user, ` 3) date : ${_DATE}`);
	// ==============================================================


	// Ask for group
	// ==============================================================
	let emojiAction: IemojiAction[] = [
		{ 'emoji': '👌', 'value': 1, 'description': 'Classe entière' },
		{ 'emoji': '☝️', 'value': 2, 'description': 'Groupe prime' },
		{ 'emoji': '✌️', 'value': 3, 'description': 'Groupe seconde' },
	];

	const groupResponse = await getEmojisResponse(
		user,
		emojiAction,
		Embed.getEmojiFormEmbed('Quel groupe est concerné par ce devoir ?', emojiAction, '‌‌ ', 'Réagissez avec l\'émoji correspondant à l\'action souhaitée.')
	);
	if (groupResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	let _GROUP = null;
	switch (groupResponse) {
	case 2:
		_GROUP = 'prime';
		break;
	case 3:
		_GROUP = 'seconde';
		break;
	}

	logForm(user, ` 4) group : ${_GROUP}`);
	// ==============================================================



	// Ask for delivery
	// ==============================================================
	emojiAction = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];

	const deliveryResponse = await getResponse(
		user,
		Embed.getEmojiFormEmbed('Ajouter des détails à ce devoir ? (facultatif)', emojiAction, 'Ici, vous pouvez indiquer des consignes de remise ou d\'autres détails', 'Réagissez avec l\'émoji pour passer ou répondez.'),
		filter = m => m.author.id === user.id,
		emojiAction,
	);
	if (deliveryResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	const _DETAILS: string | null = deliveryResponse == -1 ? null : deliveryResponse;

	logForm(user, ` 5) details : ${_DETAILS}`);
	// ==============================================================



	// Ask for link
	// ==============================================================
	emojiAction = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];
	valid = false;
	let _LINK = null;
	if (_DETAILS) {
		while (!valid) {
			const linkResponse = await getResponse(
				user,
				Embed.getEmojiFormEmbed('Ajouter un lien ? (facultatif)', emojiAction, null, 'Réagissez avec l\'émoji pour passer ou répondez avec un lien.'),
				filter = m => m.author.id === user.id,
				emojiAction
			);
			if (linkResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }
			if (linkResponse == -1) {
				valid = true;
			} else if (Utils.validURL(linkResponse)) {
				_LINK = linkResponse;
				valid = true;
			} else {
				user.send(Embed.getDefaultEmbed('Répondez avec un lien valide !'));
			}
		}
	}

	logForm(user, ` 5 bis) link : ${_LINK}`);
	// ==============================================================



	// Ask for grade
	// ==============================================================
	emojiAction = [
		{ 'emoji': '📈', 'value': true, 'description': 'Devoir noté' },
		{ 'emoji': '📉', 'value': false, 'description': 'Devoir non noté' },
		{ 'emoji': '❌', 'value': -1, 'description': 'Non renseigné' },
	];

	const gradeResponse = await getEmojisResponse(
		user,
		emojiAction,
		Embed.getEmojiFormEmbed('Le devoir est-il noté ? (facultatif)', emojiAction, null, 'Réagissez avec l\'émoji correspondant à l\'action souhaitée.')
	);
	if (gradeResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	const _NOTATION = (gradeResponse === -1 ? null : gradeResponse);

	logForm(user, ` 6) grade : ${_NOTATION}`);
	// ==============================================================


	const homework = new Homework(_SUBJECT, _TASKS, _DATE, _GROUP, _DETAILS, _LINK, _NOTATION);

	logForm(user, '== Add form ended ==');
	handleUser(user.id, true);

	await homework.persist(group);

	user.send(homework.getEmbed());
};


/**
 * Envois un message a l'utilisateur, attend sa réponse et return la reponse en question
 * @param user L'utilisateur concerné
 * @param messageContent le contenu du message qui compose la question
 * @param filter filtre des reponses du message (Pour eviter que les messages du bot soint prient pour des réponses par exemple)
 * @param emojiActions peut être null, si non a utiliser pour pouvoir repondre avec des emojis en plus de pouvoir repondre avec un message
 * @return la reponse ou null si aucune n'est donée
 */
const getResponse = async (user: Discord.User, messageContent: string | Discord.MessageEmbed, filter: Discord.CollectorFilter, emojiActions: IemojiAction[] | null = null): Promise<string | any | null> => {
	return new Promise(
		function (resolve) {
			user.send(messageContent).then((msg) => {
				if (emojiActions !== null) {
					emojiActions.forEach(element => {
						msg.react(element.emoji).catch(() => console.info('React on deleted message'));
					});

					const filter = (reaction: any, reactUser: Discord.User) => { return reactUser.id === user.id; };
					msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
						emojiActions.forEach(action => {
							if (action.emoji == collected.first()?.emoji.name) {
								resolve(action.value);
							}
						});
						resolve(null);
					}).catch(() => { });
				}

				msg.channel.awaitMessages(filter, {
					max: 1,
					time: 60000,
					errors: ['time']
				}).then(answer => {
					resolve(answer.first()?.content ?? null);
				}).catch(() => {
					if (isUserHandled(user.id))
						user.send(Embed.getDefaultEmbed('Annulation', 'Temps de réponse trop long')).catch(e => console.error(e));
					msg.delete().catch((e) => console.error(e));
					handleUser(user.id, true);
					resolve(null);
				});
			}).catch(e => console.error(e));
		}
	);
};

/**
 * Envois un message à l'utilisateur et met une liste d'emojis en dessous comme choix de reponses
 * @param user l'utilisateur concerné
 * @param emojiActions la liste des actions a faire avc les emojis
 * @param messageContent le contenu du message composant la question
 * @return la reponse ou null si aucune reponse n'est donnée
 */
const getEmojisResponse = async (user: Discord.User, emojiActions: IemojiAction[], messageContent: string | Discord.MessageEmbed): Promise<any> => {
	return new Promise(
		function (resolve) {
			user.send(messageContent).then((msg) => {
				emojiActions.forEach(element => {
					msg.react(element.emoji).catch(() => console.info('React on deleted message'));
				});

				const filter = (reaction: any, reactUser: Discord.User) => { return reactUser.id === user.id; };
				msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
					emojiActions.forEach(action => {
						if (action.emoji == collected.first()?.emoji.name) {
							resolve(action.value);
						}
					});
					resolve(null);
				}).catch(() => {
					if (isUserHandled(user.id))
						user.send(Embed.getDefaultEmbed('Annulation', 'Temps de réponse trop long')).catch(e => console.error(e));
					msg.delete().catch((e) => console.error(e));
					handleUser(user.id, true);
					resolve(null);
				});
			}).catch(e => console.error(e));
		}
	);
};

/**
 * Retourne la liste des modules à partir d'un group et une option
 * @param group le group des modules a retourner
 * @param options les options des modules a retourner
 * @return la liste des modules ainsi que l'embed comportant le tableau de tous les modules
 */
const getUserSubjects = async (group: string, options: string[]): Promise<ISubject[]> => {
	console.log('GROUPE : ' + group);

	const subjects = await getSubjects();
	const userSubjects: ISubject[] = [];

	for (const entry of Object.entries(subjects)) {
		const subject = entry[1];

		if (subject.teachingUnit != '') {
			if (subject.groups.filter((g: string) => group.startsWith(g)).length > 0 &&
				(subject.options == null || subject.options.filter((o: string) => options.includes(o)).length > 0)) {
				userSubjects.push(subject);
			}
		}
	}

	return userSubjects;
};

const logForm = (user: Discord.User, log: string | number | boolean) => {
	console.info(`[AddForm - ${user.username}]    ${log}`);
};
