import * as fireBase from '../firebase';

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

const getFromLocalFile = false;

const SUBJECTS: ISubject[] | null = null;

/**
 * Télécharge la liste de modules à partir de la db si elle n'est pas encore stockée
 * (Soit normalement une fois au lancement ou au refresh à l'aide d'une commande)
 * @return Le contenu des modules
 */
export const getSubjects = async (): Promise<ISubject[]> => {
	if (SUBJECTS === null) {
		const subjects = getFromLocalFile ? require('./subjects.json') : await fireBase.getDbData('subjects');
		console.log('[DB] Modules retrieved : ' + Object.keys(subjects).length);
		return subjects;
	}
	return SUBJECTS;
};
