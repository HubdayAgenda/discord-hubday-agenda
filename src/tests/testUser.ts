/* eslint-disable @typescript-eslint/no-var-requires */
import { expect } from 'chai';
import Subject from '../Classes/Subject';
import User from '../Classes/User';
import MockDiscord from './MockDiscord';
const dotenv = require('dotenv');

describe('User tests', () => {

	let result = dotenv.config({ path: 'env.local' });

	if (result.error || process.env.RTDB_URL === undefined || process.env.RTDB_AUTH_TOKEN === undefined) {
		console.warn('Impossible de récupérer les variables d\'environnement de configuration. dans env.local, cela peut être du au fait que le programme est éxécuté via github action');
		console.warn('Rententative avec Environment Secrets pour github');
		result = dotenv.config();
		if (result.error || process.env.RTDB_URL === undefined || process.env.RTDB_AUTH_TOKEN === undefined) {
			console.warn('Impossible de trouver les variable secrets pour github');
		}
	}

	it('checking User getFromDiscordUser()', async () => {
		expect(process.env.RTDB_URL).to.be.not.null;

		const mockDiscord = new MockDiscord();
		const testUser = mockDiscord.getUser();

		//String vide
		testUser.id = '';
		expect(User.getFromDiscordUser(testUser)).to.throw;

		//Utilisateur discord pas sur hubday
		testUser.id = '708037476781916260';
		expect(User.getFromDiscordUser(testUser)).to.throw;

		//Test avec compte Célian
		testUser.id = '316950783146983426';
		const user = await User.getFromDiscordUser(testUser);
		expect(user).to.be.not.null;
		expect(user?.discordUser.id).to.equal('316950783146983426');
		expect(user?.idnum).to.equal('criboulet');
		expect(user?.displayName).to.equal('Celian Riboulet');
		expect(user?.personalEmails).to.eql(['celian.riboulet@gmail.com']);
		expect(user?.mattermostId).to.equal('ydrrewr35pdfuf6ajsu6d6qh6r');
		expect(user?.group1).to.equal('S1B');

		//Check si dans la liste
		expect('316950783146983426' in User.USERS_LIST).to.be.true;
		expect('708037476781916260' in User.USERS_LIST).to.be.false;
	});

	it('checking getSubjects()', async () => {
		const mockDiscord = new MockDiscord();
		const testUser = mockDiscord.getUser();
		testUser.id = '316950783146983426';
		const user = await User.getFromDiscordUser(testUser);
		expect(user).to.be.not.throw;

		const subjects = await user?.getSubjects();
		expect(subjects).to.be.not.empty.and.not.undefined;

		//Check si les elements dérivent bien de l'interface Subject
		if(subjects != undefined)
			expect((subjects[0] as Subject).id != undefined).to.be.true;
	});
});
