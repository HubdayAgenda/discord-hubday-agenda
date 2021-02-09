const Embed = require("./embed");
const embed = new Embed();

const FIREBASE_CONFIG = require("../configFirebase.json");
const Firebase = require("./firebase.js");
const dataBase = new Firebase(FIREBASE_CONFIG);
class AddForm {

	async startAddForm(user) {

		const hubdayUser = await dataBase.getDbDataWithFilter("users", "discordId", user.id);

		const group = hubdayUser[Object.keys(hubdayUser)[0]].group2; // TO DO : utiliser group 1 si semestre 1

		const semester = group[1];
		const ueTab = [];

		//TO DO, ADAPTER POUR GROUP 1 EN PLUS
		try {// <- S2A S2B S2C S2D S4p1A S4p2B S4p2C S4p2D
			const sem = parseInt(semester);

			if(group.length === 3) {// <- S2A S2B S2C S2D
				ueTab.push(`UE ${sem}-1`);
				ueTab.push(`UE ${sem}-2`);
			}
			else // <- S4p1A S4p2B S4p2C S4p2D
			{
				console.error("TO DO -> semestres speciaux");
			}
		} catch (e) {// <- alternatingS2 roboticS4
			console.error("TO DO -> semestres speciaux");
		}

		const matEmbed = await embed.getMatieresEmbed(ueTab, semester);
		user.send(matEmbed).catch(e => console.error(e));


	}
}

module.exports = AddForm;
