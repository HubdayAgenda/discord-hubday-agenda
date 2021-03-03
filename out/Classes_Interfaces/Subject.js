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
exports.getSubjects = void 0;
const fireBase = require("../firebase");
const getFromLocalFile = true;
let SUBJECTS = null;
/**
 * Télécharge la liste de modules à partir de la db si elle n'est pas encore stockée
 * (Soit normalement une fois au lancement ou au refresh à l'aide d'une commande)
 * @return Le contenu des modules
 */
const getSubjects = () => __awaiter(void 0, void 0, void 0, function* () {
    if (SUBJECTS === null) {
        const subjects = getFromLocalFile ? require("./subjects.json") : yield fireBase.getDbData("subjects");
        console.log("[DB] Modules retrieved : " + Object.keys(subjects).length);
        return subjects;
    }
    return SUBJECTS;
});
exports.getSubjects = getSubjects;
//# sourceMappingURL=Subject.js.map