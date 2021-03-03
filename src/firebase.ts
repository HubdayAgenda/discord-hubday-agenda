import * as Utils from "./utils";
const fetch = require("node-fetch");
const config = require("../configFirebase.json");



const RTDB_AUTH_TOKEN = config.RTDB_AUTH_TOKEN;
const RTDB_URL = config.RTDB_URL;


export const getDbData = async(path: string) => {
	var response = await fetch(RTDB_URL + "/" + path + ".json?auth=" + RTDB_AUTH_TOKEN);

	var responseData = await Utils.gatherResponse(response);
	return responseData;
}

export const getDbDataWithFilter = async (path: string, key: any, value: any) => {
	var response = await fetch(`${RTDB_URL}/${path}.json?orderBy="${key}"&equalTo="${value}"&auth=${RTDB_AUTH_TOKEN}`);

	var responseData = await Utils.gatherResponse(response);
	return responseData;
}


export const putDbData = async (path: string, data: object | string) => {
	var options = {
		method: "PUT",
		headers: {
			"content-type": "application/json;charset=UTF-8"
		},
		body: JSON.stringify(data)
	};

	await fetch(RTDB_URL + "/" + path + ".json?auth=" + RTDB_AUTH_TOKEN, options);
}

export const postDbData = async (path: string, data: object | string) => {
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
}

