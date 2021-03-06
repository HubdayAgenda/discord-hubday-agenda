/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fetch from 'node-fetch';
import { BotLog } from './Classes_Interfaces/BotLog';

const RTDB_AUTH_TOKEN = process.env.RTDB_AUTH_TOKEN;
const RTDB_URL = process.env.RTDB_URL;

const botLog = new BotLog('Firebase');

/**
 * Récupère des informations dans la base de donnée hubday
 * @param path le chemin d'accès de la table concerné
 * @return le résultat de la requete
 */
export const getDbData = async (path: string): Promise<any> => {
	try {
		const response = await fetch.default(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN);
		return await gatherResponse(response);
	} catch (e) {
		botLog.error(e);
	}
};

/**
 * Récupère des informations dans la base de donnée hubday avec un filtre
 * @param path le chemin d'accès de la table concerné
 * @param key clé
 * @param value valeur
 * @return le résultat de la requete
 */
export const getDbDataWithFilter = async (path: string, key: string, value: string): Promise<any> => {
	try {
		const response = await fetch.default(`${RTDB_URL}/${path}.json?orderBy="${key}"&equalTo="${value}"&auth=${RTDB_AUTH_TOKEN}`);
		return await gatherResponse(response);
	} catch (e) {
		botLog.error(e);
	}
};

/**
 * Récupère des informations dans la base de donnée hubday avec un filtre compris entre deux valeurs
 * @param path le chemin d'accès de la table concerné
 * @param key clé
 * @param start valeur de début
 * @param end valeur de fin
 * @return le résultat de la requete
 */
export const getDbDataWithLimits = async (path: string, key: string, start: string, end: string): Promise<any> => {
	try {
		const response = await fetch.default(`${RTDB_URL}/${path}.json?orderBy="${key}"&startAt="${start}"&endAt="${end}"&auth=${RTDB_AUTH_TOKEN}`);
		return await gatherResponse(response);
	} catch (e) {
		botLog.error(e);
	}
};

/**
 * Met à jour des informations dans la base de donnée hubday
 * @param path le chemin d'accès de la table concerné
 * @param data Le contenu a mettre à jour
 */
export const putDbData = async (path: string, data: unknown | string): Promise<any> => {
	const options = {
		method: 'PUT',
		headers: {
			'content-type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify(data)
	};

	try {
		await fetch.default(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN, options);
	} catch (e) {
		botLog.error(e);
	}
};

/**
 * Ajoute dans la base de donnée hubday
 * @param path le chemin d'accès de la table concerné
 * @param data Le contenu a ajouter
 * @return le résultat de la requete post
 */
export const postDbData = async (path: string, data: unknown | string): Promise<any> => {
	const options = {
		method: 'POST',
		headers: {
			'content-type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify(data)
	};

	try {
		const response = await fetch.default(RTDB_URL + '/' + path + '.json?auth=' + RTDB_AUTH_TOKEN, options);
		return await gatherResponse(response);
	} catch (e) {
		botLog.error(e);
	}
};

/**
 * Convertit une réponse reçu depuis la DB dans sont bon format
 * Ex: une réponse en json sera transformée en json
 * @param response la réponse a traiter
 * @return la réponse traitée
 */
const gatherResponse = async (response: fetch.Response): Promise<string> => {
	const {
		headers
	} = response;
	const contentType = headers.get('content-type');
	if (contentType?.includes('application/json')) {
		return await response.json();
	} else if (contentType?.includes('application/text')) {
		return await response.text();
	} else if (contentType?.includes('text/html')) {
		return await response.text();
	} else {
		return await response.text();
	}
};
