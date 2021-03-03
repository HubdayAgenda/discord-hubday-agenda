import * as Utils from './utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../configFirebase.json');



const RTDB_AUTH_TOKEN = config.RTDB_AUTH_TOKEN;
const RTDB_URL = config.RTDB_URL;


export const getDbData = async(path: string): Promise<any> => {
	const response = await fetch(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN);

	const responseData = await Utils.gatherResponse(response);
	return responseData;
};

export const getDbDataWithFilter = async (path: string, key: any, value: any) => {
	const response = await fetch(`${RTDB_URL}/${path}.json?orderBy="${key}"&equalTo="${value}"&auth=${RTDB_AUTH_TOKEN}`);

	const responseData = await Utils.gatherResponse(response);
	return responseData;
};


export const putDbData = async (path: string, data: any | string): Promise<void> => {
	const options = {
		method: 'PUT',
		headers: {
			'content-type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify(data)
	};

	await fetch(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN, options);
};

export const postDbData = async (path: string, data: any | string) => {
	const options = {
		method: 'POST',
		headers: {
			'content-type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify(data)
	};

	const response = await fetch(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN, options);

	const responseData = await Utils.gatherResponse(response);
	return responseData;
};

