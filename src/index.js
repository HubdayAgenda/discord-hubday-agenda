const Discord = require("discord.js");
const botClient = new Discord.Client();
const config = require("../config.json");

botClient.login(config.token);

console.log("Hello world");

const matieres = {
    "fields": [
        {
            "name": "Algo",
            "value": "😄"
        },
        {
            "name": "Systeme",
            "value": "🤖"
        },
        {
            "name": "Anglais",
            "value": "💩"
        },
        {
            "name": "Maths",
            "value": "👩‍🎤"
        },
        {
            "name": "Web",
            "value": "🙆‍♀️"
        },
        {
            "name": "DB",
            "value": "😭"
        },
        {
            "name": "Droit",
            "value": "🤐‍"
        },
        {
            "name": "Ouistiti",
            "value": "☹️‍"
        },
        {
            "name": "Hello",
            "value": "😈‍"
        },
        {
            "name": "Bonsoir",
            "value": "👾‍"
        },

    ]
};

botClient.on("message", msg => {

    //On regarde si le message commence bien par le prefix (!)
    if (!msg.content.startsWith(config.prefix))//Si le message ne commence pas par le prefix du config.json
        return;

    switch (msg.content.substr(1).split(" ")[0]) {//Switch sur le premier mot du msg sans le prefix Ex: "!agenda dejfez" donne "agenda"
        case "test":
            testEmbedNum(msg);
            break;
    }
});

const testEmbedNum = (msg) => {
    console.log("Bonsoir");
    const embed = new Discord.MessageEmbed()
    embed.setTitle("Quelle est la matière du devoir ?");
    embed.setColor("#FFE871");
    embed.setFooter("Répondez avec le numéro de la matière");
    embed.setImage("https://s1.1zoom.me/b5050/596/Evening_Forests_Mountains_Firewatch_Campo_Santo_549147_1920x1080.jpg");
    embed.setImage("https://s1.1zoom.me/b5050/596/Evening_Forests_Mountains_Firewatch_Campo_Santo_549147_1920x1080.jpg");

    console.log(matieres.fields);
    let i = 1;
    matieres.fields.forEach(element => {
        embed.addField(element.name, i, true);
        i++;
    });
    embed.addField('━━━━━━━━━━━━━━━━━━━━━━━━━━━━','\u200B', false);
    msg.channel.send(embed);
}
