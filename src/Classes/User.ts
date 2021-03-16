import * as fireBase from '../firebase';
import Subject, { getSubjects } from './Subject';
import config from '../config';
import { UndefinedHubdayUser } from './Exceptions';
import * as Discord from 'discord.js';
import AddSubjectForm from './AddSubjectForm';

interface Dictionary<T> {
	[key: string]: T;
}

export default class User {

	/**
	 * "Cache" contenant la liste des utilisateurs ayant déjà intéragit avec le bot
	 */
	static USERS_LIST: Dictionary<User> = {};

	/**
	 * Le formulaire que cet utilisateur est en train de compléter
	 */
	addSubjectForm: null | AddSubjectForm;

	/**
	 * L'idnum de cet utilisateur
	 */
	idnum: string;

	/**
	 * Le nom d'affichage de cet utilisateur (Prénom Nom)
	 */
	displayName: string;

	/**
	 * L'adresse e-mail raccourcie de cet utilisateur (idnum@u-bordeaux.fr)
	 */
	email: string;

	/**
	 * Liste d'adresses e-mail de cet utilisateur (utilisées pour le partage Google Drive)
	 */
	personalEmails: string[] | null;

	/**
	 * Emplacement de l'image de profil de l'utilisateur
	 */
	photoURL: string;

	/**
	 * L'id Linux de cet utilisateur
	 */
	id: number;

	/**
	 * L'utilisteur discord de cet utilisateur hubday
	 */
	discordUser: Discord.User;

	/**
	 * L'id Mattermost de cet utilisateur
	 */
	mattermostId: string;

	/**
	 * Liste des groupes d'options de l'utilisateur
	 * @TODO : créer une interface 'IRole' et passer à IRole[]
	 */
	options: string[];

	/**
	 * Liste des groupes de rôles de l'utilisateur
	 * @TODO : créer une interface 'IRole' et passer à IRole[]
	 */
	roles: string[];

	/**
	 * Liste des groupes de permission de l'utilisateur
	 * @TODO : créer une interface 'IRole' et passer à IRole[]
	 */
	permissions: string[];

	/**
	 * Groupe de premier semestre de l'utilisateur
	 * Peut-être vide si l'utilisateur s'est connecté en invité de second semestre
	 * @TODO : créer une interface 'IRole' et passer à IRole
	 */
	group1: string;

	/**
	 * Groupe TP de premier semestre de l'utilisateur ("prime" ou "seconde")
	 * Renseigné que si 'group1' n'est pas vide
	 */
	subgroup1: string;

	/**
	 * Groupe de second semestre de l'utilisateur
	 * Peut-être vide si l'utilisateur s'est connecté en invité de premier semestre on s'il ne fait plus partie de l'IUT
	 * @TODO : créer une interface 'IRole' et passer à IRole
	 */
	group2: string;

	/**
	 * Groupe TP de second semestre de l'utilisateur ("prime", "seconde" ou vide dans le cas d'un étudiant de Robotique)
	 * Renseigné que si 'group2' n'est pas vide
	 */
	subgroup2: string;

	/**
	 * Les modules de l'utilisateur
	 */
	subjects: Subject[] | null;

	constructor(idnum: string, displayName: string, email: string, personalEmails: string[] | null, photoURL: string, id: number, discordUser: Discord.User, mattermostId: string, options: string[], roles: string[], permissions: string[], group1: string, subgroup1: string, group2: string, subgroup2: string) {
		this.idnum = idnum;
		this.displayName = displayName;
		this.email = email;
		this.personalEmails = personalEmails;
		this.photoURL = photoURL;
		this.id = id;
		this.discordUser = discordUser;
		this.mattermostId = mattermostId;
		this.options = options;
		this.roles = roles;
		this.permissions = permissions;
		this.group1 = group1;
		this.subgroup1 = subgroup1;
		this.group2 = group2;
		this.subgroup2 = subgroup2;
		this.subjects = null;
		this.addSubjectForm = null;
	}

	/**
	 * Récupère la liste des matières d'un utilisateur pour le semestre demandé
	   * @param semester semestre pour lequel récupérer les matières
	 * @return Liste des matières suivies par l'utilisateur durant ce semestre
	 */
	getSubjects = async (semester = 1): Promise<Subject[]> => {
		if (this.subjects === null) {
			const subjects = await getSubjects();

			this.subjects = [];

			for (const subjectId of Object.keys(subjects)) {
				const subject = subjects[subjectId];

				if (subject.teachingUnit != '') {
					if (subject.groups.filter((g: string) => (semester == 1 ? this.group1 : this.group2).startsWith(g)).length > 0 &&
						(subject.options.length == 0 || subject.options.filter((o: string) => this.options.includes(o)).length > 0)) {
						this.subjects.push(subject);
					}
				}
			}
		}

		return this.subjects;
	}

	getCurrentGroup(): string {
		return config.date.semester == 1 ? this.group1 : this.group2;
	}

	/**
	 * Récupère le profil d'un utilisateur depuis la base de données (ou le cache) à partir de son identifiant
	 * @return L'utilisateur demandé
	 */
	static getFromDiscordUser = async (discordUser: Discord.User): Promise<User> => {
		const userId = discordUser.id;
		if (!(userId in User.USERS_LIST)) {
			const userProfiles = await fireBase.getDbDataWithFilter('users', 'discordId', userId);
			if (Object.keys(userProfiles).length > 0) {
				const idnum = Object.keys(userProfiles)[0];

				const user = {
					idnum: idnum,
					...userProfiles[idnum]
				};

				User.USERS_LIST[userId] = new User(
					user.idnum,
					user.displayName,
					user.email,
					user.personalEmails,
					user.photoURL,
					user.id,
					discordUser,
					user.mattermostId,
					user.options || [],
					user.roles || [],
					user.permissions || [],
					user.group1,
					user.subgroup1,
					user.group2,
					user.subgroup2
				);
			} else {
				throw new UndefinedHubdayUser(`Cet utilisateur discord (${discordUser.username}) correspond à aucun utilisateur hubday connu`);
			}
		}
		return User.USERS_LIST[userId];
	};
}
