class Utils {
	static async gatherResponse(response) {
		const {
			headers
		} = response;
		const contentType = headers.get("content-type");
		if (contentType.includes("application/json")) {
			return await response.json();
		} else if (contentType.includes("application/text")) {
			return await response.text();
		} else if (contentType.includes("text/html")) {
			return await response.text();
		} else {
			return await response.text();
		}
	}
}

module.exports = Utils;