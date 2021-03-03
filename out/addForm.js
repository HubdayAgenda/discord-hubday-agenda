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
exports.startAddForm = void 0;
/* eslint-disable no-unreachable */
const Embed = require("./embed");
const FIREBASE_CONFIG = require("../configFirebase.json");
const fireBase = require("./firebase");
const Utils = require("./utils");
const index_1 = require("./index");
const Homework_1 = require("./Classes_Interfaces/Homework");
const Subject_1 = require("./Classes_Interfaces/Subject");
/**
 * Contient l'entièreté des questions nécéssaires à la création d'un devoir
 * A la fin du formulaire un nouveau devoir est créé
 * @param user l'utilisateur concerné par le formulaire
 */
const startAddForm = (user) => __awaiter(void 0, void 0, void 0, function* () {
    logForm(user, "== Add form started ==");
    const GROUPNUM = 2;
    // Retrieve user from DB
    // ==============================================================
    const hubdayUserResults = yield fireBase.getDbDataWithFilter("users", "discordId", user.id);
    const hubdayUser = hubdayUserResults[Object.keys(hubdayUserResults)[0]];
    if (Object.keys(hubdayUser).length == 0) {
        console.warn("User not found");
        return;
    }
    const group = hubdayUser[`group${GROUPNUM}`];
    const options = hubdayUser["options"] !== undefined ? hubdayUser["options"] : [];
    // ==============================================================
    const userSubjects = yield getUserSubjects(group, options);
    const matEmbed = yield Embed.getMatieresEmbed(userSubjects);
    // Ask for module		
    // ==============================================================
    let filter = m => m.author.id === user.id
        && !Number.isNaN(parseInt(m.content))
        && (parseInt(m.content) < Object.keys(userSubjects).length + 1)
        && (parseInt(m.content) > 0);
    const numModule = yield getResponse(user, matEmbed, filter);
    if (numModule === null) {
        console.warn("Get response error (Timeout or Exception)");
        return;
    }
    const _SUBJECT = userSubjects[numModule - 1];
    logForm(user, ` 1) subjectId : ${numModule}`);
    // ==============================================================
    //Ask for labels
    // ==============================================================
    filter = m => m.author.id === user.id;
    const labelEmbed = Embed.getDefaultEmbed(`Nouveau devoir pour le cours de ${_SUBJECT.displayId} - ${_SUBJECT.displayName}`, "Veuillez indiquer la liste des tâches à effectuer pour ce devoir", "Répondez sous la forme :\n tâche 1 | tâche 2 | tâche 3 | ...", _SUBJECT.color);
    const labelResponse = yield getResponse(user, labelEmbed, filter);
    if (labelResponse === null) {
        console.warn("Get response error (Timeout or Exception)");
        return;
    }
    const _TASKS = [];
    if (labelResponse.includes("|")) {
        labelResponse.split("|").forEach((element) => {
            _TASKS.push(element.trim());
        });
    }
    else {
        _TASKS.push(labelResponse.trim());
    }
    logForm(user, ` 2) tasks : ${_TASKS}`);
    // ==============================================================
    // Ask for date
    // ==============================================================
    let dateEmbed = Embed.getDefaultEmbed("Échéance du devoir", "Indiquer la date sous la forme JJ/MM/AAAA", null, _SUBJECT.color);
    let valid = false;
    let _DATE;
    while (!valid) {
        const dateResponse = yield getResponse(user, dateEmbed, filter = m => m.author.id === user.id);
        if (dateResponse === null) {
            console.warn("Get response error (Timeout or Exception)");
            return;
        }
        const date = Utils.dateValid(dateResponse);
        if (date != null) {
            valid = true;
            _DATE = Utils.convertDateIso(date);
        }
        else {
            dateEmbed = Embed.getDefaultEmbed("Date invalide", "Ajoutez la date sous la forme JJ/MM/AAAA", null, _SUBJECT.color);
        }
    }
    logForm(user, ` 3) date : ${_DATE}`);
    // ==============================================================
    // Ask for group
    // ==============================================================
    let emojiAction = [
        { "emoji": "👌", "value": 1, "description": "Classe entière" },
        { "emoji": "☝️", "value": 2, "description": "Groupe prime" },
        { "emoji": "✌️", "value": 3, "description": "Groupe seconde" },
    ];
    const groupResponse = yield getEmojisResponse(user, emojiAction, Embed.getEmojiFormEmbed("Quel groupe est concerné par ce devoir ?", emojiAction, "‌‌ ", "Réagissez avec l'émoji correspondant à l'action souhaitée."));
    if (groupResponse === null) {
        console.warn("Get response error (Timeout or Exception)");
        return;
    }
    let _GROUP = null;
    switch (groupResponse) {
        case 2:
            _GROUP = "prime";
            break;
        case 3:
            _GROUP = "seconde";
            break;
    }
    logForm(user, ` 4) group : ${_GROUP}`);
    // ==============================================================
    // Ask for delivery
    // ==============================================================
    emojiAction = [
        { "emoji": "❌", "value": -1, "description": "Ne pas spécifier" },
    ];
    const deliveryResponse = yield getResponse(user, Embed.getEmojiFormEmbed("Ajouter des détails à ce devoir ? (facultatif)", emojiAction, "Ici, vous pouvez indiquer des consignes de remise ou d'autres détails", "Réagissez avec l'émoji pour passer ou répondez."), filter = m => m.author.id === user.id, emojiAction);
    if (deliveryResponse === null) {
        console.warn("Get response error (Timeout or Exception)");
        return;
    }
    const _DETAILS = deliveryResponse == -1 ? null : deliveryResponse;
    logForm(user, ` 5) details : ${_DETAILS}`);
    // ==============================================================
    // Ask for link
    // ==============================================================
    emojiAction = [
        { "emoji": "❌", "value": -1, "description": "Ne pas spécifier" },
    ];
    valid = false;
    let _LINK = null;
    if (_DETAILS) {
        while (!valid) {
            const linkResponse = yield getResponse(user, Embed.getEmojiFormEmbed("Ajouter un lien ? (facultatif)", emojiAction, null, "Réagissez avec l'émoji pour passer ou répondez avec un lien."), filter = m => m.author.id === user.id, emojiAction);
            if (linkResponse === null) {
                console.warn("Get response error (Timeout or Exception)");
                return;
            }
            if (linkResponse == -1) {
                valid = true;
            }
            else if (Utils.validURL(linkResponse)) {
                _LINK = linkResponse;
                valid = true;
            }
            else {
                user.send(Embed.getDefaultEmbed("Répondez avec un lien valide !"));
            }
        }
    }
    logForm(user, ` 5 bis) link : ${_LINK}`);
    // ==============================================================
    // Ask for grade
    // ==============================================================
    emojiAction = [
        { "emoji": "📈", "value": true, "description": "Devoir noté" },
        { "emoji": "📉", "value": false, "description": "Devoir non noté" },
        { "emoji": "❌", "value": -1, "description": "Non renseigné" },
    ];
    const gradeResponse = yield getEmojisResponse(user, emojiAction, Embed.getEmojiFormEmbed("Le devoir est-il noté ? (facultatif)", emojiAction, null, "Réagissez avec l'émoji correspondant à l'action souhaitée."));
    if (gradeResponse === null) {
        console.warn("Get response error (Timeout or Exception)");
        return;
    }
    const _NOTATION = (gradeResponse === -1 ? null : gradeResponse);
    logForm(user, ` 6) grade : ${_NOTATION}`);
    // ==============================================================
    const homework = new Homework_1.Homework(_SUBJECT, _TASKS, _DATE, _GROUP, _DETAILS, _LINK, _NOTATION);
    logForm(user, "== Add form ended ==");
    index_1.handleUser(user.id, true);
    yield homework.persist(group);
    user.send(homework.getEmbed());
});
exports.startAddForm = startAddForm;
/**
 * Envois un message a l'utilisateur, attend sa réponse et return la reponse en question
 * @param user L'utilisateur concerné
 * @param messageContent le contenu du message qui compose la question
 * @param filter filtre des reponses du message (Pour eviter que les messages du bot soint prient pour des réponses par exemple)
 * @param emojiActions peut être null, si non a utiliser pour pouvoir repondre avec des emojis en plus de pouvoir repondre avec un message
 * @return la reponse ou null si aucune n'est donée
 */
const getResponse = (user, messageContent, filter, emojiActions = null) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve) {
        user.send(messageContent).then((msg) => {
            if (emojiActions !== null) {
                emojiActions.forEach(element => {
                    msg.react(element.emoji).catch(() => console.info("React on deleted message"));
                });
                const filter = (reaction, reactUser) => { return reactUser.id === user.id; };
                msg.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] }).then(collected => {
                    emojiActions.forEach(action => {
                        var _a;
                        if (action.emoji == ((_a = collected.first()) === null || _a === void 0 ? void 0 : _a.emoji.name)) {
                            resolve(action.value);
                        }
                    });
                    resolve(null);
                }).catch(() => { });
            }
            msg.channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ["time"]
            }).then(answer => {
                var _a;
                resolve((_a = answer.first()) === null || _a === void 0 ? void 0 : _a.content);
            }).catch(() => {
                if (index_1.isUserHandled(user.id))
                    user.send(Embed.getDefaultEmbed("Annulation", "Temps de réponse trop long")).catch(e => console.error(e));
                msg.delete().catch((e) => console.error(e));
                index_1.handleUser(user.id, true);
                resolve(null);
            });
        }).catch(e => console.error(e));
    });
});
/**
 * Envois un message à l'utilisateur et met une liste d'emojis en dessous comme choix de reponses
 * @param user l'utilisateur concerné
 * @param emojiActions la liste des actions a faire avc les emojis
 * @param messageContent le contenu du message composant la question
 * @return la reponse ou null si aucune reponse n'est donnée
 */
const getEmojisResponse = (user, emojiActions, messageContent) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve) {
        user.send(messageContent).then((msg) => {
            emojiActions.forEach(element => {
                msg.react(element.emoji).catch(() => console.info("React on deleted message"));
            });
            const filter = (reaction, reactUser) => { return reactUser.id === user.id; };
            msg.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] }).then(collected => {
                emojiActions.forEach(action => {
                    var _a;
                    if (action.emoji == ((_a = collected.first()) === null || _a === void 0 ? void 0 : _a.emoji.name)) {
                        resolve(action.value);
                    }
                });
                resolve(null);
            }).catch(() => {
                if (index_1.isUserHandled(user.id))
                    user.send(Embed.getDefaultEmbed("Annulation", "Temps de réponse trop long")).catch(e => console.error(e));
                msg.delete().catch((e) => console.error(e));
                index_1.handleUser(user.id, true);
                resolve(null);
            });
        }).catch(e => console.error(e));
    });
});
/**
 * Retourne la liste des modules à partir d'un group et une option
 * @param group le group des modules a retourner
 * @param options les options des modules a retourner
 * @return la liste des modules ainsi que l'embed comportant le tableau de tous les modules
 */
const getUserSubjects = (group, options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("GROUPE : " + group);
    const subjects = yield Subject_1.getSubjects();
    var userSubjects = [];
    for (var entry of Object.entries(subjects)) {
        var subject = entry[1];
        if (subject.teachingUnit != "") {
            if (subject.groups.filter((g) => group.startsWith(g)).length > 0 &&
                (subject.options == null || subject.options.filter((o) => options.includes(o)).length > 0)) {
                userSubjects.push(subject);
            }
        }
    }
    return userSubjects;
});
const logForm = (user, log) => {
    console.info(`[AddForm - ${user.username}]    ${log}`);
};
//# sourceMappingURL=addForm.js.map