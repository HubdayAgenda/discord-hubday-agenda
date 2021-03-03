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
exports.validURL = exports.dateValid = exports.convertIsoToDate = exports.convertDateIso = exports.gatherResponse = void 0;
const moment = require("moment");
exports.gatherResponse = (response) => __awaiter(void 0, void 0, void 0, function* () {
    const { headers } = response;
    const contentType = headers.get('content-type');
    if (contentType.includes('application/json')) {
        return yield response.json();
    }
    else if (contentType.includes('application/text')) {
        return yield response.text();
    }
    else if (contentType.includes('text/html')) {
        return yield response.text();
    }
    else {
        return yield response.text();
    }
});
exports.convertDateIso = (date) => {
    return moment(date).format('YYYY-MM-DD');
};
exports.convertIsoToDate = (iso) => {
    return `${('0' + iso.getDate()).slice(-2)}/${('0' + (iso.getMonth() + 1)).slice(-2)}`;
};
exports.dateValid = (date) => {
    const SEMESTER_TRANSITION_DATE = new Date('2021-01-24');
    const YEAR_START_DATE = new Date('2020-09-06 00:00:00');
    const YEAR_END_DATE = new Date('2021-06-30 23:59:59');
    const today = new Date();
    const homeworkDate = moment(date, 'DD/MM/YYYY').toDate();
    if ((today > SEMESTER_TRANSITION_DATE && homeworkDate > SEMESTER_TRANSITION_DATE && homeworkDate < YEAR_END_DATE)
        || (today <= SEMESTER_TRANSITION_DATE && homeworkDate > YEAR_START_DATE && homeworkDate < SEMESTER_TRANSITION_DATE)) {
        return homeworkDate;
    }
    return null;
};
exports.validURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return (!!pattern.test(str));
};
//# sourceMappingURL=utils.js.map