const embed = require("./embed");

const startAddForm = async (user) => {
	const matEmbed = await embed.getMatieresEmbed(["UE 1-1", "UE 1-2"]);
	user.send(matEmbed).catch(e => console.error(e));
};

exports.startAddForm = startAddForm;

