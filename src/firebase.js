const Utils = require("./utils");
const fetch = require("node-fetch");

class Firebase {
	constructor(config) {
		this.RTDB_AUTH_TOKEN = config.RTDB_AUTH_TOKEN;
		this.RTDB_URL = config.RTDB_URL;
	}

	async getDbData(path) {
		var response = await fetch(this.RTDB_URL + "/" + path + ".json?auth=" + this.RTDB_AUTH_TOKEN);

		var responseData = await Utils.gatherResponse(response);
		return responseData;
	}

	async getDbDataWithFilter(path, key, value) {
		var response = await fetch(`${this.RTDB_URL}/${path}.json?orderBy="${key}"&equalTo="${value}"&auth=${this.RTDB_AUTH_TOKEN}`);

		var responseData = await Utils.gatherResponse(response);
		return responseData;
	}


	async putDbData(path, data) {
		var options = {
			method: "PUT",
			headers: {
				"content-type": "application/json;charset=UTF-8"
			},
			body: JSON.stringify(data)
		};

		await fetch(this.RTDB_URL + "/" + path + ".json?auth=" + this.RTDB_AUTH_TOKEN, options);
	}

	async postDbData(path, data) {
		var options = {
			method: "POST",
			headers: {
				"content-type": "application/json;charset=UTF-8"
			},
			body: JSON.stringify(data)
		};

		var response = await fetch(this.RTDB_URL + "/" + path + ".json?auth=" + this.RTDB_AUTH_TOKEN, options);

		var responseData = await Utils.gatherResponse(response);
		return responseData;
	}
}

module.exports = Firebase;