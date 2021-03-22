import Subject from './Subject';
import Question, { Skip } from './Questions/Question';
import Homework from './Homework';
import User from './User';
import BotLog from './BotLog';
import { UncompleteForm } from './Exceptions';

import AskSubject from './Questions/AskSubject';
import AskTasks from './Questions/AskTasks';
import AskDate from './Questions/AskDate';
import AskDeadline from './Questions/AskDeadline';
import AskGroup from './Questions/AskGroup';
import AskDetails from './Questions/AskDetails';
import AskLink from './Questions/AskLink';
import AskNotation from './Questions/AskNotation';

type SetResponseType = ((value: null) => void) | ((value: string) => void) | ((value: string[]) => void) | ((value: Subject) => void);

interface AddFormQuestion {
	setResponse: SetResponseType,
	question: () => Question,
}

export interface IemojiAction {
	emoji: string,
	value: number | boolean | null | string,
	description: string
}

export default class AddSubjectForm {

	/**
	 * L'utilisateur correspondant à ce formulaire
	 */
	user: User;

	botLog: BotLog;

	constructor(user: User) {
		this.user = user;
		user.addSubjectForm = this;
		this.botLog = new BotLog('Formulaire d\'ajout', user.discordUser, user);
	}

	subject: Subject | undefined;
	setSubject = (value: Subject): void => { this.subject = value; }

	tasks: string[] | undefined
	setTasks = (value: string[]): void => { this.tasks = value; }

	date: string | undefined;
	setDate = (value: string): void => { this.date = value; }

	deadline: string | null | undefined;
	setDeadline = (value: string | null): void => { this.deadline = value; }

	group: string | null | undefined;
	setGroup = (value: string | null): void => { this.group = value; }

	details: string | null | undefined;
	setDetails = (value: string | null): void => { this.details = value; }

	link: string | null | undefined;
	setLink = (value: string | null): void => { this.link = value; }

	notation: boolean | null | undefined;
	setNotation = (value: boolean | null): void => { this.notation = value; }

	/**
	 * @returns vrai si ce formulaire est complet
	 */
	isComplete(): boolean {
		if ((this.subject as Subject) == undefined)
			throw new UncompleteForm('Subject undefined');
		if (<string[]>this.tasks == undefined)
			throw new UncompleteForm('Tasks undefined');
		if (<string>this.date == undefined)
			throw new UncompleteForm('Date undefined');
		if (typeof(this.deadline) == 'undefined')
			throw new UncompleteForm('Deadline undefined');
		if (typeof(this.group) == 'undefined')
			throw new UncompleteForm('Group undefined');
		if (typeof(this.details) == 'undefined')
			throw new UncompleteForm('Details undefined');
		if (typeof(this.link) == 'undefined')
			throw new UncompleteForm('Link undefined');
		if (typeof(this.notation) == 'undefined')
			throw new UncompleteForm('Notation undefined');
		return true;
	}

	/**
	 * Créer un devoir à partir de ce formulaire (Uniquement si il est complet)
	 * @returns Le devoir correspondant à ce formulaire
	 * @throws Erreur de formulaire incomplet
	 */
	createHomework(): Homework | never {
		if (!this.isComplete())
			throw new UncompleteForm('Le formulaire n\'est pas complet, il est donc impossible de créer un devoir à partir de ce dernier');

		this.botLog.log('Devoir créé');
		return new Homework(
			<Subject>this.subject,
			<string[]>this.tasks,
			<string>this.date,
			<string | null>this.deadline,
			<string | null>this.group,
			<string | null>this.details,
			<string | null>this.link,
			<boolean | null>this.notation
		);
	}

	/**
	 * @returns Le devoir de ce formulaire
	 */
	async start(): Promise<Homework> {
		const subjects = await this.user.getSubjects();

		/**
		 * Ordre des questiond du formulaire d'ajout
		 * - Une question est liée avec une fonction qui assigne sa réponse dans une variable
		 */
		const questions: (AddFormQuestion | AddFormQuestion[])[] = [
			{ setResponse: this.setSubject, question: (): Question => { return new AskSubject(this.user, this.botLog, subjects); } },
			{ setResponse: this.setTasks, question: (): Question => { return new AskTasks(this.user, this.botLog, <Subject>this.subject); } },
			{ setResponse: this.setDate, question: (): Question => { return new AskDate(this.user, this.botLog, <Subject>this.subject); } },
			{ setResponse: this.setDeadline, question: (): Question => { return new AskDeadline(this.user, this.botLog, <Subject>this.subject); } },
			{ setResponse: this.setGroup, question: (): Question => { return new AskGroup(this.user, this.botLog, <Subject>this.subject); } },
			[
				{ setResponse: this.setDetails, question: (): Question => { return new AskDetails(this.user, this.botLog, <Subject>this.subject); } },
				{ setResponse: this.setLink, question: (): Question => { return new AskLink(this.user, this.botLog, <Subject>this.subject); } }, // Question prise en compte si la précédente ne donne pas un résultat null
			],
			{ setResponse: this.setNotation, question: (): Question => { return new AskNotation(this.user, this.botLog, <Subject>this.subject); } },
		];

		for (const question of questions) {
			//Cas ou l'on rentre dans un array de dépendance de question
			// (Une question est éxécutée si la précedente à une réponse non null)
			if ((question as AddFormQuestion[]).length != undefined) {
				const dependentQuestions: AddFormQuestion[] = (question as AddFormQuestion[]);
				let hasSkip = false;
				for (const dependentQuestion of dependentQuestions) {
					if (hasSkip) {
						dependentQuestion.setResponse(<never>null);
						continue;
					}
					if (await this.handleQuestion(dependentQuestion as AddFormQuestion) == true)//On pose la question + si elle est null on stop
						hasSkip = true;
				}
			} else {
				await this.handleQuestion(question as AddFormQuestion);
			}
		}
		this.user.addSubjectForm = null;
		return this.createHomework();
	}

	/**
	 * Pose une question et enregistre son résultat
	 * @param formQuestion La question a poser
	 * @return vrai si la reponse a été passée
	 */
	private async handleQuestion(formQuestion: AddFormQuestion): Promise<boolean> {
		const question = formQuestion.question();
		const response = await question.ask();

		const logBody = (response as Subject).name != undefined ? (response as Subject).displayName : response;
		this.botLog.log(`[${question.getContext()}] ${logBody}`);

		formQuestion.setResponse(<never>((response instanceof Skip) ? null : response));
		return (response instanceof Skip);
	}
}
