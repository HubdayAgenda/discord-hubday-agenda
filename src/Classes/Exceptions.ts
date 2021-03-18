export class QuestionTimeOutException extends Error{
	constructor(content: string){super(content);}
}

export class UndefinedHubdayUser extends Error{
	constructor(content: string){super(content);}
}

export class UncompleteForm extends Error{
	constructor(content: string){super(content);}
}
