/* eslint-disable @typescript-eslint/no-var-requires */
import { expect } from 'chai';
import { Subject } from '../Classes_Interfaces/Subject';
import { User } from '../Classes_Interfaces/User';

describe('User tests', () => {

	require('dotenv').config({ path: 'env.local' });

	it('checking User getFromDiscordId()', async () => {
		expect(process.env.RTDB_URL).to.be.not.null;

		//String vide
		let user = await User.getFromDiscordId('');
		expect(user).to.be.null;

		//Utilisateur discord pas sur hubday
		user = await User.getFromDiscordId('708037476781916260');
		expect(user).to.be.null;

		//Test avec compte Célian
		user = await User.getFromDiscordId('316950783146983426');
		expect(user).to.be.not.null;
		expect(user?.discordId).to.equal('316950783146983426');
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
		const user = await User.getFromDiscordId('316950783146983426');
		expect(user).to.be.not.null;

		const subjects = await user?.getSubjects();
		expect(subjects).to.be.not.empty.and.not.undefined;

		//Check si les elements dérivent bien de l'interface Subject
		if(subjects != undefined)
			expect((subjects[0] as Subject).id != undefined).to.be.true;
	});
});
