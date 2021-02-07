const embed = require("./embed");

/**
 * 
 */
const startAddForm = async (user) => {
	//Recup les UE (?)
	
	//Demande la matiere
	const matEmbed = await embed.getMatieresEmbed(["UE 1-1", "UE 1-2"]);
	user.send(matEmbed).catch(e => console.error(e));

	//Demande la description

	//Demande la date

	//...

	//Envois a la db (?)
};

exports.startAddForm = startAddForm;
