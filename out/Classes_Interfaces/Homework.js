"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Homework = void 0;
const Discord = require("discord.js");
const fireBase = require("../firebase");
class Homework {
    /**
     * Créer un nouveau devoir et l'envoyer sur la base de donnée Hubday
     * @param subject Module du devoir
     * @param tasks liste des taches du devoir
     * @param date date de remise du devoir
     * @param group group concerné
     * @param details details du devoir
     * @param link lien lié au details du devoir
     * @param notation indique si le devoir est noté
     * @param lessonId id de la lesson associé au devoir
     */
    constructor(subject, tasks, date, /*deadline,*/ group, details, link, notation) {
        this.id = null;
        this.subject = subject;
        this.tasks = tasks;
        this.date = date;
        //this.deadline = deadline;
        this.group = group;
        this.details = details;
        this.link = link;
        this.notation = notation;
        this.lessonId = null;
    }
    /**
     * Créer un embed a partir de ce devoir avec toutes ses informations
     * @return l'embed de ce devoir
     */
    getEmbed() {
        const embed = new Discord.MessageEmbed()
            .setColor(this.subject.color)
            .setTitle(`${this.subject.displayId} - ${this.subject.displayName}`)
            .setURL("https://www.hubday.fr/dashboard#subject/" + this.subject.id)
            .setAuthor("Devoir enregistré avec succès ! [Voir]", "https://www.hubday.fr/favicon/apple-touch-icon-72x72-precomposed.png", "https://www.hubday.fr/dashboard#homework/" + this.id + "/view")
            .setFooter("Échéance", "https://images.emojiterra.com/google/android-nougat/512px/23f1.png")
            .setTimestamp(new Date(this.date));
        let description = "";
        if (this.details !== null) {
            if (this.details !== null)
                description += (`[${this.details}](${this.link})\n`);
            else
                description += this.details + "\n";
        }
        this.tasks.forEach(element => {
            description += `\n🔳 ${element}\n`;
        });
        description += (this.notation !== null ? (this.notation ? "\n📈 Devoir noté\n" : "\n📉 Devoir non noté\n") : "");
        description += "‌‌ ";
        embed.setDescription(description);
        return embed;
    }
    /**
     * Retourne ce devoir sous forme JSON
     * @return objet json de ce devoir
     */
    getJSON() {
        return {
            "id": this.id,
            "subject": this.subject.id,
            "tasks": this.tasks,
            "date": this.date,
            //"deadline": "16:10:00",
            "group": this.group,
            "notation": this.notation,
            "details": this.details,
            "link": this.link,
        };
    }
    /**
     * Envois ce devoir sur la base de donnée Hubday ou le met à jour si il est déjà enregistré
     * @param group group concerné par ce devoir
     */
    persist(group) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id === null) { // Nouveau devoir
                const result = yield fireBase.postDbData(`homeworks/${group}`, this.getJSON());
                this.id = result.name;
            }
            else { // Devoir existant : mise à jour
                yield fireBase.putDbData(`homeworks/${group}/${this.id}`, this.getJSON());
            }
        });
    }
}
exports.Homework = Homework;
//# sourceMappingURL=Homework.js.map