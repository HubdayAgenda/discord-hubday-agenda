import * as Embed from './embed';
import * as fireBase from './firebase';
import * as Utils from './utils';
import { handleUser, isUserHandled } from './index';
import { Homework } from './Classes_Interfaces/Homework';
import { ISubject, getSubjects } from './Classes_Interfaces/Subject';
import { User } from './Classes_Interfaces/User';
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

	// Retrieve user from DB or cache
	// ==============================================================
	const hubdayUser : User | null = await User.getFromDiscordId(user.id);
	if (hubdayUser === null) {
		console.error('User not found');
		return;
	}

	// Retrieve user subjects from DB or cache
	// ==============================================================
	/**
	 * @TODO : passer à une variable pour configure le semestre à utiliser
	 */
	const userSubjects : ISubject[] = await hubdayUser.getSubjects(2);
	const matEmbed = await Embed.getMatieresEmbed(userSubjects);

	// Ask what subject the homework is about
	// ==============================================================
	let filter: Discord.CollectorFilter = m => m.author.id === user.id
		&& !Number.isNaN(parseInt(m.content))
		&& (parseInt(m.content) < Object.keys(userSubjects).length + 1)
		&& (parseInt(m.content) > 0);

	const subjectNb: number | null = await getResponse(user, matEmbed, filter);
	if (subjectNb === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	const _SUBJECT = userSubjects[subjectNb - 1];

	/**
	 * @TODO : passer l'interface ISubject à une classe Subject et ajouter une méthode getDisplayName(short : boolean)
	 */
	logForm(user, ` 1) subject : ${_SUBJECT.id} (${_SUBJECT.displayId} - ${_SUBJECT.displayName})`);
	// ==============================================================


	// Request the list of tasks that make up the homework
	// ==============================================================
	filter = m => m.author.id === user.id;
	const labelEmbed = Embed.getDefaultEmbed(
		`Nouveau devoir pour le cours de ${_SUBJECT.displayId} - ${_SUBJECT.displayName}`,
		'Veuillez indiquer la liste des tâches à effectuer pour ce devoir',
		'Répondez sous la forme :\n tâche 1 | tâche 2 | tâche 3 | ...',
		_SUBJECT.color,
	);

	const tasksResponse = await getResponse(user, labelEmbed, filter);
	if (tasksResponse === null) { console.warn('Get response error (Timeout or Exception)'); return; }

	const _TASKS : string[] = [];
	tasksResponse.split('|').forEach((task: string) => {
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

	/**
	 * @TODO : passer à une variable pour configure le semestre à utiliser
	 */
	await homework.persist(hubdayUser.group2);

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

const logForm = (user: Discord.User, log: string | number | boolean) => {
	console.info(`[AddForm - ${user.username}]    ${log}`);
};
