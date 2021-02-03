const Discord = require("discord.js");
const botClient = new Discord.Client();
const discordConfig = require("../config.json");

const { CanvasTable, CTConfig } = require("canvas-table");
const { createCanvas, loadImage } = require("canvas");

botClient.login(discordConfig.token);

const modules = require("./modules");

console.log("Started !")

/**
 * Donne un ue
 * Retourne tous les modules de cet ue
 */
const getModulesByUE = (ue) => {
	let tab = [];
	for (var mod in modules) {
		if (modules[mod].ue == ue) {
			tab.push(modules[mod]);
		}
	}
	return tab;
};

// console.log(getModulesByUE("UE 1-1"));


botClient.on("message", msg => {

	//On regarde si le message commence bien par le prefix (!)
	if (!msg.content.startsWith(discordConfig.prefix))//Si le message ne commence pas par le prefix du config.json
		return;

	switch (msg.content.substr(1).split(" ")[0]) {//Switch sur le premier mot du msg sans le prefix Ex: "!agenda dejfez" donne "agenda"
		case "test":
			testCanvas(msg, ["UE 3-1", "UE 3-2", "UE 3-3"]);
			break;
	}
});

const getData = (mods) => {
	let data = [];
	let i = 1;
	mods.forEach(mod => {
		const ligne = [i.toString(), mod.name, mod.ue];
		data.push(ligne);
		i++;
	});
	return data;
};

const columns = [
	{
		title: "Numero",
		options: {
			textAlign: "center",
			fontSize: 20,
			fontWeight: "bold",
			fontFamily: "arial",
			color: "#444444",
			lineHeight: 3,
		}
	},
	{
		title: "Nom",
		options: {
			textAlign: "left",
			fontSize: 20,
			fontWeight: "bold",
			fontFamily: "arial",
			color: "#444444",
			lineHeight: 3,
		}
	},
	{
		title: "UE",
		options: {
			textAlign: "center",
			fontSize: 20,
			fontWeight: "bold",
			fontFamily: "arial",
			color: "#444444",
			lineHeight: 3,
		}
	}
];

const options = {
	borders: {
		table: { color: "#444444", width: 3 }
	},
	fit: true,
	options: {
		textAlign: "center",
	},
	header: {
		fontSize: 20,
		fontFamily: "arial",
		color: "#db74b0",
	},
};

/*
const data: CTData = [
	["cell 1", "cell 2", "cell 3"], // row 1
	["cell 1", "cell 2", "cell 3"] // row 2
];
*/

const testCanvas = async (msg, ue) => {
	const mod = [];
	ue.forEach(element => {
		getModulesByUE(element).forEach(matiere => {
			mod.push(matiere);
		});
	});

	const canvas = createCanvas(1920 / 3, 1080 / 2.3);

	const data = getData(mod);
	console.log(data);
	const ct = new CanvasTable(canvas, {
		data,
		columns,
		options
	});
	await ct.generateTable();
	await ct.renderToFile("test-table.png");

	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), "image.png");

	const embed = new Discord.MessageEmbed()
		.attachFiles(attachment)
		.setColor("#afdab9")
		.setImage("attachment://image.png")
		.setFooter("Repondez avec le numéro correspondant")
		.setAuthor("Cliquez sur l'image pour zoomer !", "https://www.hubday.fr/favicon/apple-touch-icon.png");
	msg.channel.send(embed);
};



/*
borders: {
		column: undefined,
		header: undefined,
		row: { width: 1, color: "#555" },
		table: { width: 2, color: "#aaa" }
	},
	header: {
		fontSize: 12,
		fontWeight: "bold",
		fontFamily: "sans-serif",
		color: "#666666",
		lineHeight: 1.2,
		textAlign: "left",
		padding: 5
	},
	cell: {
		fontSize: 12,
		fontWeight: "normal",
		fontFamily: "sans-serif",
		color: "#444444",
		lineHeight: 1.2,
		padding: 5,
		textAlign: "left"
	},
	background: "#ffffff",
	devicePixelRatio: 2,
	fader: {
		right: true,
		size: 40,
		bottom: true
	},
	padding: {
		bottom: 20,
		left: 20,
		right: 20,
		top: 20
	},
	subtitle: {
		fontSize: 14,
		fontWeight: "normal",
		fontFamily: "sans-serif",
		color: "#888888",
		lineHeight: 1,
		multiline: false,
		// text: "",
		textAlign: "center"
	},
	title: {
		fontSize: 14,
		fontWeight: "bold",
		fontFamily: "sans-serif",
		color: "#666666",
		lineHeight: 1,
		multiline: false,
		// text: "",
		textAlign: "center"
	}
*/