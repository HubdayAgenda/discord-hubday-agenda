import * as fireBase from '../firebase';
import { BotLog } from './BotLog';
import * as subjectsLocalFile from './subjects.json';

interface Dictionary<T> {
	[key: string]: T;
}

export class Subject {
	/**
	 * Id de la matière
	 */
	id: string

	/**
	 * Listes d'aliases correspondants à cette matière
	 */
	aliases: string[];

	/**
	 * Couleur de la matière (au format #ffffff)
	 */
	color: string;

	/**
	 * Numéro de la matière
	 */
	displayId: string;

	/**
	 * Nom long d'affichage de la matière
	 */
	displayName: string;

	/**
	 * Nom court d'affichage de la matière
	 * Peut-être vide
	 */
	shortName: string;

	/**
	 * Groupes par lesquels est suivie cette matière
	 */
	groups: string[];

	/**
	 * Nom du fichier de l'icône correspondant à la matière
	 */
	icon: string;

	/**
	 * Lien Moodle de la matière
	 * Peut être vide
	 */
	moodle: string;

	/**
	 * Nom de la matière sur Hyperplanning
	 */
	name: string;

	/**
	 * Groupes d'option par lesquels est suivie cette matière
	 */
	options: string[]

	/**
	 * Unité d'enseignement à laquelle appartient la matière
	 */
	teachingUnit: string;

	constructor(
		id: string,
		aliases: string[],
		color: string,
		displayId: string,
		displayName: string,
		groups: string[] | null,
		icon: string,
		moodle: string,
		name: string,
		options: string[] | null,
		shortName: string,
		teachingUnit: string
	) {
		this.id = id;
		this.aliases = aliases;
		this.color = color;
		this.displayId = displayId;
		this.displayName = displayName;
		this.groups = groups || [];
		this.icon = icon;
		this.moodle = moodle;
		this.name = name;
		this.options = options || [];
		this.shortName = shortName;
		this.teachingUnit = teachingUnit;
	}

	/**
	 * Retourne le nom de la matière
	 * @param short permet de choisir entre le nom long ou raccouri
	 * @return Le nom d'affichage de la matière
	 */
	getDisplayName = (short = false): string => {
		return this.displayId + ' - ' + (short && this.shortName !== '' ? this.shortName : this.displayName);
	}

	/*getLessonsOfDay = (date : Date) : Dictionary<string> => {
		return {key: ''};
	}*/
}

/**
 * True -> ne télécharge pas le fichier contenant l'ensemble des modules a chaque lancement du bot
 */
const getFromLocalFile = true;

/**
 * Liste des modules présents pour toutes classe et tout niveau confondus
 */
let SUBJECTS: Dictionary<Subject> | null = null;

/**
 * Télécharge la liste de modules à partir de la db si elle n'est pas encore stockée
 * (Soit normalement une fois au lancement ou au refresh à l'aide d'une commande)
 * @return Le contenu des modules
 */
export const getSubjects = async (): Promise<Dictionary<Subject>> => {
	if (SUBJECTS === null) {
		SUBJECTS = {};
		const subjects = getFromLocalFile ? subjectsLocalFile : await fireBase.getDbData('subjects');

		for (const subjectId of Object.keys(subjects)){
			const subject = {
				id: subjectId,
				...subjects[subjectId]
			};

			SUBJECTS[subjectId] = new Subject(
				subject.id,
				subject.aliases,
				subject.color,
				subject.displayId,
				subject.displayName,
				subject.groups,
				subject.icon,
				subject.moodle,
				subject.name,
				subject.options,
				subject.shortName,
				subject.teachingUnit
			);
		}

		BotLog.log('Modules retrieved : ' + Object.keys(SUBJECTS).length);
	}
	return SUBJECTS;
};
