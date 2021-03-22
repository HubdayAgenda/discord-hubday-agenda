/* eslint-disable @typescript-eslint/no-var-requires */
import { expect } from 'chai';
import { handleUser, isUserHandled } from '../userLoad';
import MockDiscord from './MockDiscord';

describe('userLoad test', () => {

	it('checking userLoad handleUser() isUserHandled()', async () => {
		const testUser1 = new MockDiscord().getUser();
		testUser1.id = 'user-id1';
		const testUser2 = new MockDiscord().getUser();
		testUser2.id = 'user-id2';

		// User1 ne doit pas etre handled
		expect(isUserHandled(testUser1.id)).to.be.false;

		// User2 ne doit pas etre handled
		expect(isUserHandled(testUser2.id)).to.be.false;

		// On handle user1
		expect(handleUser(testUser1, false, false)).to.be.undefined;

		// User1 doit être handled
		expect(isUserHandled(testUser1.id)).to.be.true;

		// User2 ne doit pas etre handled
		expect(isUserHandled(testUser2.id)).to.be.false;

		// On handle user2
		expect(handleUser(testUser2, false, false)).to.be.undefined;

		// User2 ne doit etre handled
		expect(isUserHandled(testUser2.id)).to.be.true;

		// User1 ne doit pas pouvoir être rehandled
		expect(handleUser(testUser1, false, false)).to.be.equal(-1);

		// On unhandle User1
		expect(handleUser(testUser1, true, false)).to.be.undefined;

		// User2 ne doit etre handled
		expect(isUserHandled(testUser2.id)).to.be.true;

		// User1 ne doit pas etre handled
		expect(isUserHandled(testUser1.id)).to.be.false;

		// On unhandle User2
		expect(handleUser(testUser2, true, false)).to.be.undefined;

		// User2 ne doit pas etre handled
		expect(isUserHandled(testUser2.id)).to.be.false;
	});
});
