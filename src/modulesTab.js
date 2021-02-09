const Discord = require("discord.js");

const { CanvasTable } = require("canvas-table");
const { createCanvas } = require("canvas");

class ModuleTab {

	constructor(modules) {
		this.modules = modules;
	}
	/**
	 * Création du canvas avec les matières et les UE
	 * @param ueList tableau contenant les UE 
	 * @return la canvas mis en forme
	 */
	async getTabImageAttachment(ueList) {
		const mod = [];
		ueList.forEach(element => {
			this.getModulesByUE(element).forEach(matiere => {
				mod.push(matiere);
			});
		});

		const canvas = createCanvas(1920 / 3, 25 * mod.length + 50);

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
	 * Permet de recuperer les objets de module à partir d'une liste d'ue
	 * @param ue tableau comprenant les ue à prendre en compte
	 * @return tableau des modules correspondants aux ue
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
		mods.forEach(mod => {
			const ligne = [i.toString(), mod.name, mod.ue];
			data.push(ligne);
			i++;
		});
		return data;
	}

}
/**
 * Affichage des colonnes pour le canvas
 */
const columns = [
	{
		title: "Numero",
		options: {
			textAlign: "center",
			fontSize: 14,
			fontWeight: "bold",
			fontFamily: "arial",
			color: "#afdab9",
			lineHeight: 5,
		}
	},
	{
		title: "Module",
		options: {
			textAlign: "left",
			fontSize: 12,
			fontWeight: "bold",
			fontFamily: "arial",
			color: "white",
			lineHeight: 5,
		},
	},
	{
		title: "UE",
		options: {
			textAlign: "center",
			fontSize: 12,
			fontWeight: "bold",
			fontFamily: "arial",
			color: "white",
			lineHeight: 5,
		},
	}
];

/**
 * Options pour le canvas
 */
const options = {
	background: "#2c2f33",
	borders: {
		table: { color: "#bababa", width: 2 },
		row: { width: 2, color: "##bababa" },
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