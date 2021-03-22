import * as moment from 'moment';
import config from './config';

export const dateAndHourToDate = (date: string, hour: string): Date => {
	return moment(date + ' ' + hour, 'YYYY-MM-DD HH:mm:ss').toDate();
};

/**
 * Convertit une date en une string correspondante dans un format valide pour hubday
 * @param date La date a convertir
 * @returns La string correspondante sous le format adapté pour hubday
 */
export const dateToStringValidFormat = (date: Date): string => {
	return moment(date).format('YYYY-MM-DD');
};

/**
 * Permet de réupérer une date X jours après aujourd'hui
 * @param days le nombre de jour qui qui nous séparent de la date
 * @returns La date relative de X jours par rapport à aujourd'hui
 */
export const getRelativeDate = (days: number): Date => {
	return moment(new Date(), 'YYYY-MM-DD').add(days, 'day').toDate();
};

/**
 * Determine si un string est une date valide au format DD/MM/YYYY, si c'est le cas, cette date sera
 * retournée en tant qu'instance de Date, si ce n'est pas le cas null sera retourné.
 * @param date date sous forme de string a vérifier puis instancier en tant qu'objet de la classe Date
 * @returns Objet de la classe Date si la string en entrée est valide, sinon null dans le cas invalide
 */
export const dateValid = (date: string): Date | null => {
	const today = new Date();

	const homeworkDate = moment(date, 'DD/MM/YYYY').toDate();

	if ((today > config.date.semesterTransition && homeworkDate > config.date.semesterTransition && homeworkDate < config.date.yearEnd)
		|| (today <= config.date.semesterTransition && homeworkDate > config.date.yearStart && homeworkDate < config.date.semesterTransition)) {
		return homeworkDate;
	}
	return null;
};

/**
 * Determine si une date sous forme de string est valide ou non
 * @param hour heure sous forme de string a vériier
 * @returns true si la string en entré correspond bien à une heure valide (HH:MM) et [00:00-23:59]
 */
export const hourValid = (hour: string): boolean => {
	if (hour.includes(':')) {
		const split = hour.split(':');
		if (split.length == 2) {
			const h = parseInt(split[0]);
			const m = parseInt(split[1]);
			if (!isNaN(h) && !isNaN(m)) {
				return (h >= 0 && h < 24 && m >= 0 && m < 60);
			}
		}
	}
	return false;
};

/**
 * Determine une string est une url
 * @param str string a verifier
 * @returns true si la string est ben une url
 */
export const validURL = (urlString: string): boolean => {
	let url;
	try {
		url = new URL(urlString);
	} catch (_) {
		return false;
	}
	return url.protocol === 'http:' || url.protocol === 'https:';
};

/**
 * Determine le prochain jour voulu dans la semaine
 * @param dayWeek le jour de la semaine voulu (tout en minuscule et en anglais)
 * @returns la date de ce jour
 */
export const getNextDay = (dayWeek: string): Date => {
	const dayOfWeek = moment().day(dayWeek).hour(0).minute(0).second(0).millisecond(0);
	const endOfToday = moment().hour(23).minute(59).second(59);

	if(dayOfWeek.isBefore(endOfToday)) {
		dayOfWeek.add(1, 'weeks');
	}

	return dayOfWeek.toDate();
};
