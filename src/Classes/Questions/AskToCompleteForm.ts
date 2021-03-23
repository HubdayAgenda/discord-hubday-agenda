import Subject from '../Subject';
import User from '../User';
import Question, { Skip } from './Question';
import BotLog from '../BotLog';
import * as Embed from '../../embed';
import * as Discord from 'discord.js';
import AddSubjectForm from '../AddSubjectForm';

export default class AskToCompleteForm extends Question {

	static emojiAction = [
		{ 'emoji': '✅', 'value': true, 'description': 'Reprendre le formulaire' },
		{ 'emoji': '❌', 'value': false, 'description': 'Recommencer depuis le début' },
	];

	async send(): Promise<Discord.Message> {
		return new Promise((resolve, reject) => {
			const embed = Embed.getEmojiFormEmbed(
				'Reprendre l\'ajout d\'un devoir',
				AskToCompleteForm.emojiAction,
				'Vous n\'avez pas terminé d\'ajouter un devoir',
				'Réagissez avec l\'émoji correspondant à l\'action souhaitée.'
			);

			this.user.discordUser.send(embed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));

			if (!this.user.addSubjectForm) return;
			const form: AddSubjectForm = this.user.addSubjectForm;

			const uncompleteHomeworkEmbed = new Discord.MessageEmbed();
			uncompleteHomeworkEmbed.setAuthor(form.subject?.getDisplayName() || 'Matière à choisir');
			uncompleteHomeworkEmbed.addField('Taches : ', form.tasks || 'A completer');
			uncompleteHomeworkEmbed.addField('Date : ', form.date || 'A completer');
			uncompleteHomeworkEmbed.addField('Heure : ', form.deadline || 'A completer');
			uncompleteHomeworkEmbed.addField('Groupe : ', form.group || 'A completer');
			uncompleteHomeworkEmbed.addField('Détails : ', form.details || 'A completer');
			uncompleteHomeworkEmbed.addField('Lien : ', form.link || 'A completer');
			uncompleteHomeworkEmbed.addField('Notation : ', form.notation || 'A completer');

			this.user.discordUser.send(uncompleteHomeworkEmbed)
				.then(msg => resolve(msg))
				.catch(e => reject(e));
		});
	}

	async awaitResponse(msg: Discord.Message): Promise<string | string[] | number | Subject | boolean | Skip> {
		return await super.awaitResponse(msg, true);
	}

	getContext(): string {
		return 'Reprise formulaire';
	}

	constructor(user: User, botLog: BotLog) {
		super(user, botLog);
		this.emojiActions = AskToCompleteForm.emojiAction;
	}
}
