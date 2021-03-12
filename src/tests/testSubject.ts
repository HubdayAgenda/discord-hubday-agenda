/* eslint-disable @typescript-eslint/no-var-requires */
import { expect } from 'chai';
import Subject, { getSubjects } from '../Classes_Interfaces/Subject';
const dotenv = require('dotenv');

describe('Subject tests', () => {

	let result = dotenv.config({ path: 'env.local' });

	if (result.error || process.env.RTDB_URL === undefined || process.env.RTDB_AUTH_TOKEN === undefined) {
		console.warn('Impossible de récupérer les variables d\'environnement de configuration. dans env.local, cela peut être du au fait que le programme est éxécuté via github action');
		console.warn('Rententative avec Environment Secrets pour github');
		result = dotenv.config();
		if (result.error || process.env.RTDB_URL === undefined || process.env.RTDB_AUTH_TOKEN === undefined) {
			console.warn('Impossible de trouver les variable secrets pour github');
		}
	}

	it('checking getSubjects()', async () => {
		expect(process.env.RTDB_URL).to.be.not.null;

		const subjects = await getSubjects();
		expect(subjects).to.be.not.empty;
		for (const subjectId of Object.keys(subjects)) {
			const subject = subjects[subjectId];
			expect(subject).to.not.be.undefined.and.to.not.be.null;

			expect('id' in subject).to.be.true;
			expect(subject.id.length).to.not.equal(0);
		}
	});

});
