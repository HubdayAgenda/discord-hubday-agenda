import { expect } from 'chai';
import * as utils from '../utils';
import config from '../config';
import * as moment from 'moment';

describe('Utils tests', () => {

	it('checking utils dateAndHourToDate()', () => {
		const date = utils.dateAndHourToDate('2021-03-22', '21:30:00');
		const expected = moment('22/03/2021', 'DD-MM-YYYY').toDate();
		expected.setHours(21);
		expected.setMinutes(30);
		expected.setSeconds(0);
		expect(date).to.eql(expected);
	});

	it('checking utils dateToStringValidFormat()', () => {
		expect(utils.dateToStringValidFormat(moment('22/04/2021', 'DD-MM-YYYY').toDate())).to.eql('2021-04-22');
		expect(utils.dateToStringValidFormat(moment('26/01/2021', 'DD-MM-YYYY').toDate())).to.eql('2021-01-26');
		expect(utils.dateToStringValidFormat(moment('15/04/2030', 'DD-MM-YYYY').toDate())).to.eql('2030-04-15');
	});

	it('checking utils dateToStringReadableFormat()', () => {
		expect(utils.dateToStringReadableFormat(moment('22/04/2021', 'DD-MM-YYYY').toDate())).to.eql('22/04/2021');
		expect(utils.dateToStringReadableFormat(moment('26/01/2021', 'DD-MM-YYYY').toDate())).to.eql('26/01/2021');
		expect(utils.dateToStringReadableFormat(moment('15/04/2030', 'DD-MM-YYYY').toDate())).to.eql('15/04/2030');
	});

	it('checking utils getRelativeDate()', () => {
		const date = moment(new Date(), 'YYYY-MM-DD').add(2, 'day').toDate().setSeconds(0).toPrecision(1);
		expect(date).to.eql(utils.getRelativeDate(2).setSeconds(0).toPrecision(1));
	});

	it('checking utils dateDayToString()', () => {
		expect(utils.dateDayToString(moment('22/03/2021', 'DD-MM-YYYY').toDate())).to.eql('Lundi');
		expect(utils.dateDayToString(moment('23/03/2021', 'DD-MM-YYYY').toDate())).to.eql('Mardi');
		expect(utils.dateDayToString(moment('24/03/2021', 'DD-MM-YYYY').toDate())).to.eql('Mercredi');
		expect(utils.dateDayToString(moment('25/03/2021', 'DD-MM-YYYY').toDate())).to.eql('Jeudi');
		expect(utils.dateDayToString(moment('26/03/2021', 'DD-MM-YYYY').toDate())).to.eql('Vendredi');
		expect(utils.dateDayToString(moment('27/03/2021', 'DD-MM-YYYY').toDate())).to.eql('Samedi');
		expect(utils.dateDayToString(moment('28/03/2021', 'DD-MM-YYYY').toDate())).to.eql('Dimanche');
	});

	it('checking utils getNextDay()', () => {
		const dimanche = utils.getNextDay('sunday');
		expect(dimanche).to.eql(moment('28/03/2021', 'DD/MM/YYYY').toDate());

		const lundi = utils.getNextDay('monday');
		expect(lundi).to.eql(moment('29/03/2021', 'DD/MM/YYYY').toDate());

		const mercredi = utils.getNextDay('wednesday');
		expect(mercredi).to.eql(moment('24/03/2021', 'DD/MM/YYYY').toDate());

		const vendredi = utils.getNextDay('friday');
		expect(vendredi).to.eql(moment('26/03/2021', 'DD/MM/YYYY').toDate());
	});

	it('checking utils dateValid()', () => {
		expect(config.date).to.be.not.undefined;
		expect(utils.dateValid('22/04/2021')).to.be.not.null;
		expect(utils.dateValid('22/04/2021')).to.be.eql(moment('22/04/2021', 'DD/MM/YYYY').toDate());
		expect(utils.dateValid('22:04:2021')).to.be.eql(moment('22/04/2021', 'DD/MM/YYYY').toDate());
		expect(utils.dateValid('29/06/2021')).to.be.not.null;
		expect(utils.dateValid('18/12/2021')).to.be.null;
		expect(utils.dateValid('zifuyiezqd')).to.be.null;
		expect(utils.dateValid('20/10/2020')).to.be.null;
		expect(utils.dateValid('20/20/2020')).to.be.null;
		expect(utils.dateValid('34/02/2020')).to.be.null;
		expect(utils.dateValid('34/02/3040')).to.be.null;
	});

	it('checking utils hourValid()', () => {
		expect(utils.hourValid('00:00')).to.be.true;
		expect(utils.hourValid('22:30')).to.be.true;
		expect(utils.hourValid('10:00')).to.be.true;
		expect(utils.hourValid('23:59')).to.be.true;
		expect(utils.hourValid('02:00')).to.be.true;
		expect(utils.hourValid('2:00')).to.be.true;
		expect(utils.hourValid('22h30')).to.be.false;
		expect(utils.hourValid('24:00')).to.be.false;
		expect(utils.hourValid('24:0')).to.be.false;
		expect(utils.hourValid('michel')).to.be.false;
	});

	it('checking utils validUrl()', () => {
		expect(utils.validURL('http://silant.net')).to.be.true;
		expect(utils.validURL('https://moodle1.u-bordeaux.fr/')).to.be.true;
		expect(utils.validURL('michel')).to.be.false;
		expect(utils.validURL('://')).to.be.false;
		expect(utils.validURL('http//michel.com')).to.be.false;
	});
});
