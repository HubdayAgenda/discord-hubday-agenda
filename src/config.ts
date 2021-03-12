const SEMESTER_TRANSITION_DATE = new Date('2021-01-24');
const YEAR_START_DATE = new Date('2020-09-06 00:00:00');
const YEAR_END_DATE = new Date('2021-06-30 23:59:59');

export default {
	global: {
		getSubjectsFromFile: true,
		logHookLevel: 2
	},
	bot: {
		version: '0.0.0',
		prefix: '!'
	},
	date : {
		yearStart: YEAR_START_DATE,
		yearEnd: YEAR_END_DATE,
		semesterTransition: SEMESTER_TRANSITION_DATE,
		semester: new Date() < SEMESTER_TRANSITION_DATE ? 1 : 2
	}
};
