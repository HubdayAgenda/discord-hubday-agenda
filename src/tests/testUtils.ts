import { expect } from 'chai';
import * as utils from '../utils';

describe('Utils tests', () => {
	it('checking utils dateValid()', () => { // the single test
		// expect(utils.dateValid('zifuyiezqd')).to.be.null;
		// expect(utils.dateValid('22/04/2020')).to.be.not.null;
		// expect(utils.dateValid('20/10/2020')).to.be.null;
		// expect(utils.dateValid('20/20/2020')).to.be.null;
		// expect(utils.dateValid('34/02/2020')).to.be.null;
		// expect(utils.dateValid('22:04:2021')).to.be.null;
	});

	it('checking utils hourValid()', () => { // the single test
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

	it('checking utils validUrl()', () => { // the single test
		expect(utils.validURL('http://silant.net')).to.be.true;
		expect(utils.validURL('https://moodle1.u-bordeaux.fr/')).to.be.true;
		expect(utils.validURL('michel')).to.be.false;
		expect(utils.validURL('://')).to.be.false;
		expect(utils.validURL('http//michel.com')).to.be.false;
	});

});
