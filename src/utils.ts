import * as moment from 'moment';
import { config } from './config';

export const convertDateIso = (date: Date): string => {
	return moment(date).format('YYYY-MM-DD');
};

export const dateValid = (date: string): Date | null => {
	const today = new Date();

	const homeworkDate = moment(date, 'DD/MM/YYYY').toDate();

	if ((today > config.dates.semesterTransition && homeworkDate > config.dates.semesterTransition && homeworkDate < config.dates.yearEnd)
		|| (today <= config.dates.semesterTransition && homeworkDate > config.dates.yearStart && homeworkDate < config.dates.semesterTransition)) {
		return homeworkDate;
	}
	return null;
};

export const hourValid = (hour: string): boolean => {
	if(hour.includes(':')){
		const split = hour.split(':');
		if(split.length == 2){
			const h = parseInt(split[0]);
			const m = parseInt(split[1]);
			if(!isNaN(h) && !isNaN(m)){
				return (h >= 0 && h < 24 && m >= 0 && m < 60);
			}
		}
	}
	return false;
};

export const validURL = (str : string): boolean => {
	const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	return (!!pattern.test(str));
};
