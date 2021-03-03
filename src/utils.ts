import * as moment from 'moment';

export const gatherResponse = async (response: any): Promise<any> => {
	const {
		headers
	} = response;
	const contentType = headers.get('content-type');
	if (contentType.includes('application/json')) {
		return await response.json();
	} else if (contentType.includes('application/text')) {
		return await response.text();
	} else if (contentType.includes('text/html')) {
		return await response.text();
	} else {
		return await response.text();
	}
};

export const convertDateIso = (date: Date): string => {
	return moment(date).format('YYYY-MM-DD');
};

export const dateValid = (date: string): Date | null => {
	const SEMESTER_TRANSITION_DATE = new Date('2021-01-24');
	const YEAR_START_DATE = new Date('2020-09-06 00:00:00');
	const YEAR_END_DATE = new Date('2021-06-30 23:59:59');

	const today = new Date();

	const homeworkDate = moment(date, 'DD/MM/YYYY').toDate();

	if ((today > SEMESTER_TRANSITION_DATE && homeworkDate > SEMESTER_TRANSITION_DATE && homeworkDate < YEAR_END_DATE)
		|| (today <= SEMESTER_TRANSITION_DATE && homeworkDate > YEAR_START_DATE && homeworkDate < SEMESTER_TRANSITION_DATE)) {
		return homeworkDate;
	}
	return null;
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
