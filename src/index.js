const Discord = require("discord.js");
const botClient = new Discord.Client();
const discordConfig = require("../config.json");

const modulesTab = require("./modulesTab");

// botClient.api.applications(botClient.id).guilds('796320659759300628').commands.post({data: {
//     name: 'ping',
//     description: 'ping pong!'
// }})

botClient.on('ready', () => {
	console.log("Started !")

    botClient.api.applications(botClient.user.id).commands.post({
        data: {
            name: "agenda",
            description: "Permet d'ajouter un devoir dans l'agenda Discord et Hudbay"
        }
    });


    botClient.ws.on('INTERACTION_CREATE', async interaction => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;

        if (command === 'agenda'){ 
			botClient.users.fetch(interaction.member.user.id)
			.then(async (user) => {
				console.log(user);
				user.send(await testCanvas(["UE 1-1", "UE 1-2"]))
			})
        }
    });
});

// botClient.on("message", msg => {

// 	//On regarde si le message commence bien par le prefix (!)
// 	if (!msg.content.startsWith(discordConfig.prefix))//Si le message ne commence pas par le prefix du config.json
// 		return;

// 	switch (msg.content.substr(1).split(" ")[0]) {//Switch sur le premier mot du msg sans le prefix Ex: "!agenda dejfez" donne "agenda"
// 		case "test":
// 			break;
// 	}
// });


const testCanvas = async (ue) => {

	const attachment = await modulesTab.getTabImageAttachment(ue);

	const embed = new Discord.MessageEmbed()
		.attachFiles(attachment)
		.setColor("#afdab9")
		.setImage("attachment://image.png")
		.setFooter("Repondez avec le numéro correspondant")
		.setAuthor("Cliquez sur l'image pour zoomer !", "https://www.hubday.fr/favicon/apple-touch-icon.png");
	return embed;
}



botClient.login(discordConfig.token);
