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
exports.postDbData = exports.putDbData = exports.getDbDataWithFilter = exports.getDbData = void 0;
const Utils = require("./utils");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../configFirebase.json');
const RTDB_AUTH_TOKEN = config.RTDB_AUTH_TOKEN;
const RTDB_URL = config.RTDB_URL;
exports.getDbData = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN);
    const responseData = yield Utils.gatherResponse(response);
    return responseData;
});
exports.getDbDataWithFilter = (path, key, value) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`${RTDB_URL}/${path}.json?orderBy="${key}"&equalTo="${value}"&auth=${RTDB_AUTH_TOKEN}`);
    const responseData = yield Utils.gatherResponse(response);
    return responseData;
});
exports.putDbData = (path, data) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        method: 'PUT',
        headers: {
            'content-type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(data)
    };
    yield fetch(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN, options);
});
exports.postDbData = (path, data) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(data)
    };
    const response = yield fetch(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN, options);
    const responseData = yield Utils.gatherResponse(response);
    return responseData;
});
//# sourceMappingURL=firebase.js.map