import * as Embed from './embed';
import * as Utils from './utils';
import { handleUser, isUserHandled } from './index';
import { Homework } from './Classes_Interfaces/Homework';
import { Subject } from './Classes_Interfaces/Subject';
import { User } from './Classes_Interfaces/User';
import * as Discord from 'discord.js';
import { config } from './config';

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

	// Retrieve user from DB or cache
	// ==============================================================
	const hubdayUser: User | null = await User.getFromDiscordId(user.id);
	if (hubdayUser === null) {
		user.send(Embed.getDefaultEmbed('Vous n\'avez pas été reconnu comme membre hubday', 'Vous devez rejoindre ce serveur discord pour que le bot vous reconnaisse: https://discord.iut-info.cf'));
		return;
	}

	// Retrieve user subjects from DB or cache
	// ==============================================================
	const userSubjects: Subject[] = await hubdayUser.getSubjects(config.dates.semester);
	const subjectEmbed = await Embed.getMatieresEmbed(userSubjects);

	// Ask what subject the homework is about
	// ==============================================================
	let filter: Discord.CollectorFilter = m => m.author.id === user.id
		&& !Number.isNaN(parseInt(m.content))
		&& (parseInt(m.content) < Object.keys(userSubjects).length + 1)
		&& (parseInt(m.content) > 0);

	const subjectNb = await getResponse(user, subjectEmbed, filter);
	if (subjectNb === null || typeof parseInt(subjectNb.toString()) != 'number') { console.warn(`Get response error (Timeout or number Exception) - ${typeof subjectNb}`); return; }

	const _SUBJECT: Subject = userSubjects[parseInt(subjectNb.toString()) - 1];

	logForm(user, ` 1) subject : ${_SUBJECT.id} (${_SUBJECT.getDisplayName()})`);
	// ==============================================================


	// Request the list of tasks that make up the homework
	// ==============================================================
	filter = m => m.author.id === user.id;
	const labelEmbed = Embed.getDefaultEmbed(
		`Nouveau devoir pour le cours de ${_SUBJECT.getDisplayName()}`,
		'Veuillez indiquer la liste des tâches à effectuer pour ce devoir',
		'Répondez sous la forme :\n tâche 1 | tâche 2 | tâche 3 | ...',
		_SUBJECT.color,
	);

	const tasksResponse = await getResponse(user, labelEmbed, filter);
	if (tasksResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	const _TASKS: string[] = [];
	tasksResponse.toString().split('|').forEach((task: string) => {
		_TASKS.push(task.trim());
	});

	logForm(user, ` 2) tasks : ${_TASKS}`);
	// ==============================================================



	// Ask for homework date
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

		const date = Utils.dateValid(dateResponse.toString());

		if (date != null) {
			valid = true;
			_DATE = Utils.dateToStringValidFormat(date);
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



	// Ask for deadline
	// ==============================================================
	let emojiAction: IemojiAction[] = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];
	valid = false;
	let _DEADLINE: string | null = null;

	while (!valid) {
		const deadlineResponse = await getResponse(
			user,
			Embed.getEmojiFormEmbed('Indiquer une heure de remise ?', emojiAction, 'Donnez l\'heure sous la forme HH:MM', 'Réagissez avec l\'émoji pour passer ou répondez.', _SUBJECT.color),
			filter = m => m.author.id === user.id,
			emojiAction,
		);
		if (deadlineResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }
		if (Utils.hourValid(deadlineResponse.toString())) {
			valid = true;
			_DEADLINE = deadlineResponse.toString() + ':00';
		} else if (deadlineResponse == -1) {
			valid = true;
		} else {
			user.send(Embed.getDefaultEmbed('Répondez avec une heure valide !', null, null, _SUBJECT.color));
		}
	}

	logForm(user, ` 4) deadline : ${_DEADLINE}`);
	// ==============================================================



	// Ask for group
	// ==============================================================
	emojiAction = [
		{ 'emoji': '👌', 'value': 1, 'description': 'Classe entière' },
		{ 'emoji': '☝️', 'value': 2, 'description': 'Groupe prime' },
		{ 'emoji': '✌️', 'value': 3, 'description': 'Groupe seconde' },
	];

	const groupResponse = await getEmojisResponse(
		user,
		emojiAction,
		Embed.getEmojiFormEmbed('Quel groupe est concerné par ce devoir ?', emojiAction, '‌‌ ', 'Réagissez avec l\'émoji correspondant à l\'action souhaitée.', _SUBJECT.color)
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

	logForm(user, ` 5) group : ${_GROUP}`);
	// ==============================================================



	// Ask for delivery
	// ==============================================================
	emojiAction = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];

	const deliveryResponse = await getResponse(
		user,
		Embed.getEmojiFormEmbed('Ajouter des détails à ce devoir ? (facultatif)', emojiAction, 'Ici, vous pouvez indiquer des consignes de remise ou d\'autres détails', 'Réagissez avec l\'émoji pour passer ou répondez.', _SUBJECT.color),
		filter = m => m.author.id === user.id,
		emojiAction,
	);
	if (deliveryResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	const _DETAILS: string | null = deliveryResponse == -1 ? null : deliveryResponse.toString();

	logForm(user, ` 6) details : ${_DETAILS}`);
	// ==============================================================



	// Ask for link
	// ==============================================================
	emojiAction = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];
	valid = false;
	let _LINK: null | string = null;
	if (_DETAILS) {
		while (!valid) {
			const linkResponse = await getResponse(
				user,
				Embed.getEmojiFormEmbed('Ajouter un lien ? (facultatif)', emojiAction, null, 'Réagissez avec l\'émoji pour passer ou répondez avec un lien.', _SUBJECT.color),
				filter = m => m.author.id === user.id,
				emojiAction
			);
			if (linkResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }
			if (linkResponse == -1) {
				valid = true;
			} else if (typeof linkResponse == 'string' && Utils.validURL(linkResponse.toString())) {
				_LINK = linkResponse;
				valid = true;
			} else {
				user.send(Embed.getDefaultEmbed('Répondez avec un lien valide !', null, null, _SUBJECT.color));
			}
		}
	}

	logForm(user, ` 6 bis) link : ${_LINK}`);
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
		Embed.getEmojiFormEmbed('Le devoir est-il noté ? (facultatif)', emojiAction, null, 'Réagissez avec l\'émoji correspondant à l\'action souhaitée.', _SUBJECT.color)
	);
	if (gradeResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	let _NOTATION: null | boolean = null;
	if (gradeResponse != -1) {
		_NOTATION = gradeResponse ? true : false;
	}

	logForm(user, ` 7) grade : ${_NOTATION}`);
	// ==============================================================


	const homework = new Homework(_SUBJECT, _TASKS, _DATE, _DEADLINE, _GROUP, _DETAILS, _LINK, _NOTATION);

	logForm(user, '== Add form ended ==');
	handleUser(user.id, true);

	await homework.persist(config.dates.semester === 1 ? hubdayUser.group1 : hubdayUser.group2);

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
export const getResponse = async (user: Discord.User, messageContent: string | Discord.MessageEmbed, filter: Discord.CollectorFilter, emojiActions: IemojiAction[] | null = null): Promise<null | number | boolean | string> => {
	return new Promise(
		function (resolve) {
			user.send(messageContent).then((msg) => {
				if (emojiActions !== null) {
					emojiActions.forEach(element => {
						msg.react(element.emoji).catch(() => console.info('React on deleted message'));
					});

					const filter = (reaction: unknown, reactUser: Discord.User) => { return reactUser.id === user.id; };
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
const getEmojisResponse = async (user: Discord.User, emojiActions: IemojiAction[], messageContent: string | Discord.MessageEmbed): Promise<null | number | boolean> => {
	return new Promise(
		function (resolve) {
			user.send(messageContent).then((msg) => {
				emojiActions.forEach(element => {
					msg.react(element.emoji).catch(() => console.info('React on deleted message'));
				});

				const filter = (reaction: unknown, reactUser: Discord.User) => { return reactUser.id === user.id; };
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

const logForm = (user: Discord.User, log: string | number | boolean) => {
	console.info(`[AddForm - ${user.username}]    ${log}`);
};
