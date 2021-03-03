import * as fireBase from '../firebase';
import * as subjectsLocalFile from './subjects.json';

export interface ISubject {
	id: string
	aliases: string[];
	color: string,
	displayId: string,
	displayName: string,
	groups: string[],
	icon: string,
	moodle: string,
	name: string,
	options: string[]
	shortName: string,
	teachingUnit: string
}

/**
 * True -> ne télécharge pas le fichier contenant l'ensemble des modules a chaque lancement du bot
 */
const getFromLocalFile = true;

/**
 * Liste des modules présents pour toutes classe et tout niveau confondus
 */
const SUBJECTS: ISubject[] | null = null;

/**
 * Télécharge la liste de modules à partir de la db si elle n'est pas encore stockée
 * (Soit normalement une fois au lancement ou au refresh à l'aide d'une commande)
 * @return Le contenu des modules
 */
export const getSubjects = async (): Promise<ISubject[]> => {
	if (SUBJECTS === null) {
		const subjects = getFromLocalFile ? subjectsLocalFile : await fireBase.getDbData('subjects');
		console.log('[DB] Modules retrieved : ' + Object.keys(subjects).length);
		return subjects;
	}
	return SUBJECTS;
};
