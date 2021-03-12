import * as Discord from 'discord.js';
import * as Embed from './embed';
import * as Utils from './utils';
import * as Exceptions from './Classes_Interfaces/Exceptions';
import { handleUser, isUserHandled } from './index';
import Homework from './Classes_Interfaces/Homework';
import Subject from './Classes_Interfaces/Subject';
import User from './Classes_Interfaces/User';
import dateConfig from './dateConfig';
import BotLog from './Classes_Interfaces/BotLog';

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
	const botLog = new BotLog('Formulaire d\'ajout', user);
	botLog.info('Début formulaire');

	// Retrieve user from DB or cache
	// ==============================================================
	const hubdayUser: User | null = await User.getFromDiscordId(user.id);
	if (hubdayUser === null) {
		user.send(Embed.getDefaultEmbed(
			'Vous n\'avez pas été reconnu comme membre hubday',
			'Vous devez rejoindre ce serveur discord pour que le bot vous reconnaisse: https://discord.iut-info.cf'
		)).catch((e) => botLog.error(e));
		throw new Exceptions.UndefinedHubdayUser(user.username);
	}

	botLog.setHubdayUser(hubdayUser);

	// Retrieve user subjects from DB or cache
	// ==============================================================
	const userSubjects: Subject[] = await hubdayUser.getSubjects(dateConfig.semester);
	const subjectEmbed = await Embed.getMatieresEmbed(userSubjects);

	// Ask what subject the homework is about
	// ==============================================================
	let filter: Discord.CollectorFilter = m => m.author.id === user.id
		&& !Number.isNaN(parseInt(m.content))
		&& (parseInt(m.content) < Object.keys(userSubjects).length + 1)
		&& (parseInt(m.content) > 0);

	const subjectNb = await getResponse(user, botLog, subjectEmbed, filter)
		.catch(e => { throw e; });

	const _SUBJECT: Subject = userSubjects[parseInt(subjectNb.toString()) - 1];

	botLog.log(` 1) subject : ${_SUBJECT.id} (${_SUBJECT.getDisplayName()})`);
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

	const tasksResponse = await getResponse(user, botLog, labelEmbed, filter)
		.catch(e => { throw e; });

	const _TASKS: string[] = [];
	tasksResponse.toString().split('|').forEach((task: string) => {
		_TASKS.push(task.trim());
	});

	botLog.log(` 2) tasks : ${_TASKS}`);
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
		const dateResponse = await getResponse(user, botLog, dateEmbed, filter = m => m.author.id === user.id)
			.catch(e => { throw e; });

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

	botLog.log(` 3) date : ${_DATE}`);
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
			botLog,
			Embed.getEmojiFormEmbed('Indiquer une heure de remise ?',
				emojiAction,
				'Donnez l\'heure sous la forme HH:MM',
				'Réagissez avec l\'émoji pour passer ou répondez.',
				_SUBJECT.color
			),
			filter = m => m.author.id === user.id,
			emojiAction,
		).catch(e => { throw e; });
		if (Utils.hourValid(deadlineResponse.toString())) {
			valid = true;
			_DEADLINE = deadlineResponse.toString() + ':00';
		} else if (deadlineResponse == -1) {
			valid = true;
		} else {
			user.send(Embed.getDefaultEmbed('Répondez avec une heure valide !', null, null, _SUBJECT.color));
		}
	}

	botLog.log(` 4) deadline : ${_DEADLINE}`);
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
		botLog,
		emojiAction,
		Embed.getEmojiFormEmbed('Quel groupe est concerné par ce devoir ?',
			emojiAction,
			'‌‌ ',
			'Réagissez avec l\'émoji correspondant à l\'action souhaitée.',
			_SUBJECT.color
		)
	).catch(e => { throw e; });

	let _GROUP = null;
	switch (groupResponse) {
		case 2:
			_GROUP = 'prime';
			break;
		case 3:
			_GROUP = 'seconde';
			break;
	}

	botLog.log(` 5) group : ${_GROUP}`);
	// ==============================================================



	// Ask for delivery
	// ==============================================================
	emojiAction = [
		{ 'emoji': '❌', 'value': -1, 'description': 'Ne pas spécifier' },
	];

	const deliveryResponse = await getResponse(
		user,
		botLog,
		Embed.getEmojiFormEmbed('Ajouter des détails à ce devoir ? (facultatif)',
			emojiAction,
			'Ici, vous pouvez indiquer des consignes de remise ou d\'autres détails',
			'Réagissez avec l\'émoji pour passer ou répondez.',
			_SUBJECT.color
		),
		filter = m => m.author.id === user.id,
		emojiAction,
	).catch(e => { throw e; });

	const _DETAILS: string | null = deliveryResponse == -1 ? null : deliveryResponse.toString();

	botLog.log(` 6) details : ${_DETAILS}`);
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
				botLog,
				Embed.getEmojiFormEmbed(
					'Ajouter un lien ? (facultatif)',
					emojiAction,
					null,
					'Réagissez avec l\'émoji pour passer ou répondez avec un lien.',
					_SUBJECT.color
				),
				filter = m => m.author.id === user.id,
				emojiAction
			).catch(e => { throw e; });
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

	botLog.log(` 6 bis) link : ${_LINK}`);
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
		botLog,
		emojiAction,
		Embed.getEmojiFormEmbed('Le devoir est-il noté ? (facultatif)', emojiAction, null, 'Réagissez avec l\'émoji correspondant à l\'action souhaitée.', _SUBJECT.color)
	).catch(e => { throw e; });

	let _NOTATION: null | boolean = null;
	if (gradeResponse != -1) {
		_NOTATION = gradeResponse ? true : false;
	}

	botLog.log(` 7) grade : ${_NOTATION}`);
	// ==============================================================


	const homework = new Homework(_SUBJECT, _TASKS, _DATE, _DEADLINE, _GROUP, _DETAILS, _LINK, _NOTATION);

	botLog.log('== Add form ended ==');
	handleUser(user, true);

	await homework.persist(dateConfig.semester === 1 ? hubdayUser.group1 : hubdayUser.group2);

	user.send(homework.getEmbed());
};


/**
 * Envois un message a l'utilisateur, attend sa réponse et return la reponse en question
 * @param user L'utilisateur concerné
 * @param messageContent le contenu du message qui compose la question
 * @param filter filtre des reponses du message (Pour eviter que les messages du bot soint prient pour des réponses par exemple)
 * @param emojiActions peut être null, si non a utiliser pour pouvoir repondre avec des emojis en plus de pouvoir repondre avec un message
 * @return la reponse donnée
 */
export const getResponse = async (user: Discord.User, botLog: BotLog, messageContent: string | Discord.MessageEmbed, filter: Discord.CollectorFilter, emojiActions: IemojiAction[] | null = null): Promise<number | boolean | string> => {
	return new Promise(
		function (resolve, reject) {
			user.send(messageContent).then((msg) => {
				if (emojiActions !== null) {
					emojiActions.forEach(element => {
						msg.react(element.emoji).catch(() => botLog.warn('React on deleted message'));
					});

					const filter = (reaction: unknown, reactUser: Discord.User) => { return reactUser.id === user.id; };
					msg.awaitReactions(filter, { max: 1, time: 120000 + 10, errors: ['time'] }).then(collected => {
						emojiActions.forEach(action => {
							if (action.emoji == collected.first()?.emoji.name) {
								if (action.value)
									resolve(action.value);
							}
						});
					}).catch((e) => reject(e));
				}

				msg.channel.awaitMessages(filter, {
					max: 1,
					time: 120000,
					errors: ['time']
				}).then(answer => {
					const content = answer.first()?.content;
					if (typeof content !== 'undefined')
						resolve(content);
				}).catch(() => {
					if (isUserHandled(user.id))
						user.send(Embed.getDefaultEmbed('Annulation', 'Temps de réponse trop long')).catch(e => botLog.error(e));
					msg.delete().catch((e) => botLog.error(e));
					reject(new Exceptions.TimeOutException(user.username));
				});
			}).catch(e => reject(e));
		}
	);
};

/**
 * Envois un message à l'utilisateur et met une liste d'emojis en dessous comme choix de reponses
 * @param user l'utilisateur concerné
 * @param emojiActions la liste des actions a faire avc les emojis
 * @param messageContent le contenu du message composant la question
 * @return la reponse donnée
 */
const getEmojisResponse = async (user: Discord.User, botLog: BotLog, emojiActions: IemojiAction[], messageContent: string | Discord.MessageEmbed): Promise<number | boolean> => {
	return new Promise(
		function (resolve, reject) {
			user.send(messageContent).then((msg) => {
				emojiActions.forEach(element => {
					msg.react(element.emoji).catch(() => botLog.warn('React on deleted message'));
				});

				const filter = (reaction: unknown, reactUser: Discord.User) => { return reactUser.id === user.id; };
				msg.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] }).then(collected => {
					emojiActions.forEach(action => {
						if (action.emoji == collected.first()?.emoji.name) {
							if (action.value)
								resolve(action.value);
						}
					});
				}).catch(() => {
					if (isUserHandled(user.id))
						user.send(Embed.getDefaultEmbed('Annulation', 'Temps de réponse trop long')).catch(e => botLog.error(e));
					msg.delete().catch((e) => botLog.error(e));
					reject(new Exceptions.TimeOutException(user.username));
				});
			}).catch(e => reject(e));
		}
	);
};
