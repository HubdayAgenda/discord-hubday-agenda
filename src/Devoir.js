class Devoir {
	/*
		-> module : string
		-> label : string[] -> minimum 1
		-> date : new Date().toISOString()
		-> group : string "" -> groupe entier | "prime | "seconde" -> groupe de l'utilisateur

		-> delivery : string (intitulé du lien)
		-> link : string (lien Moodle, consignes) -> optionnel
		-> notation : boolean
		-> courseId : string -> proposer de lier a un cours si la date correspond a un cours
	*/

	constructor(modul_, label, date, group, delivery, link, notation, courseId) {
		this.module = modul_;
		this.label = label;
		this.date = date;
		this.group = group;
		this.delivery = delivery;
		this.link = link;
		this.notation = notation;
		this.courseId = courseId;
	}

	// async persist() {
	// 	if (this.id === undefined) { // Nouveau devoir

	// 	} else { // Devoir existant : mise à jour

	// 	}
	// }
}

exports.Devoir = Devoir;
