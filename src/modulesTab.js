const Discord = require("discord.js");

const { CanvasTable } = require("canvas-table");
const { createCanvas } = require("canvas");

class ModuleTab {

	constructor(modules) {
		this.modules = modules;
	}
	/**
	 * Création du canvas avec les matières et les UE
	 * @param userModules
	 * @return la canvas mis en forme
	 */
	async getTabImageAttachment(mod) { 

		const canvas = createCanvas(1965 / 3, 25 * mod.length + 100);

		const data = this.modulesToTabData(mod);

		const ct = new CanvasTable(canvas, {
			data,
			columns,
			options
		});
		await ct.generateTable();
		await ct.renderToFile("test-table.png");

		return new Discord.MessageAttachment(canvas.toBuffer(), "image.png");
	}

	/**
	 * Permet de recuperer les objets de module à partir d'un seul UE'
	 * @param ue l'ue
	 * @return tableau des modules correspondants a l'UE
	 */
	getModulesByUE(ue) {
		let tab = [];
		for (var mod in this.modules) {
			if (this.modules[mod].ue == ue) {
				tab.push(this.modules[mod]);
			}
		}
		return tab;
	}

	/**
	 * Transforme une liste de module sous une forme utilisée pour générer un tableau
	 * @param mods liste des modules a afficher dans le tableau
	 * @return Les modules sous forme lisible pour canvas-table
	 */
	modulesToTabData(mods) {
		let data = [];
		let i = 1;
		data.push(["", "", ""]);
		mods.forEach(mod => {
			const ligne = [i.toString(), mod.displayId + " - " + mod.displayName];
			data.push(ligne);
			i++;
		});
		data.push(["", "", ""]);
		return data;
	}

}
/**
 * Affichage des colonnes pour le canvas
 */
const columns = [
	{
		title: "Numéro",
		options: {
			textAlign: "center",
			fontSize: 18,
			fontWeight: "bold",
			fontFamily: "arial",
			color: "#afdab9",
			lineHeight: 21,
		}
	},
	{
		title: "Module",
		options: {
			textAlign: "left",
			fontSize: 18,
			fontWeight: "bold",
			fontFamily: "arial",
			color: "white",
			lineHeight: 21,
		},
	},
	// {
	// 	title: "UE",
	// 	options: {
	// 		textAlign: "center",
	// 		fontSize: 12,
	// 		fontWeight: "bold",
	// 		fontFamily: "arial",
	// 		color: "white",
	// 		lineHeight: 5,
	// 	},
	// }
];

/**
 * Options pour le canvas
 */
const options = {
	devicePixelRatio: 1,
	background: "#2f3136",
	borders: {
		table: { color: "#bababa", width: 2 },
		// row: { width: 2, color: "#bababa" },
	},
	fit: true,
	options: {
		textAlign: "center",
	},
	header: {
		fontSize: 16,
		fontFamily: "arial",
		color: "#afdab9",
	},
};

module.exports = ModuleTab;
