"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postDbData = exports.putDbData = exports.getDbDataWithFilter = exports.getDbData = void 0;
const Utils = require("./utils");
const fetch = require("node-fetch");
const config = require("../configFirebase.json");
const RTDB_AUTH_TOKEN = config.RTDB_AUTH_TOKEN;
const RTDB_URL = config.RTDB_URL;
exports.getDbData = async (path) => {
    var response = await fetch(RTDB_URL + "/" + path + ".json?auth=" + RTDB_AUTH_TOKEN);
    var responseData = await Utils.gatherResponse(response);
    return responseData;
};
exports.getDbDataWithFilter = async (path, key, value) => {
    var response = await fetch(`${RTDB_URL}/${path}.json?orderBy="${key}"&equalTo="${value}"&auth=${RTDB_AUTH_TOKEN}`);
    var responseData = await Utils.gatherResponse(response);
    return responseData;
};
exports.putDbData = async (path, data) => {
    var options = {
        method: "PUT",
        headers: {
            "content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(data)
    };
    await fetch(RTDB_URL + "/" + path + ".json?auth=" + RTDB_AUTH_TOKEN, options);
};
exports.postDbData = async (path, data) => {
    var options = {
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(data)
    };
    var response = await fetch(RTDB_URL + "/" + path + ".json?auth=" + RTDB_AUTH_TOKEN, options);
    var responseData = await Utils.gatherResponse(response);
    return responseData;
};
//# sourceMappingURL=firebase.js.map