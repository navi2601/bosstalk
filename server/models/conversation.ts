"use strict";
import {Entity} from "./entity";
import seq from "./sequence";

export interface ConvoMessage {
	speaker: string;
	message: string;
}

export class Conversation implements Entity {
	id: string;
	uploadTime: Date;
	title: string;
	context: string;
	messages: ConvoMessage[];

	constructor() {
		this.id = "";
		this.uploadTime = new Date();
		this.context = "";
		this.messages = [];
	}

	get parties(): Iterable<string> {
		return seq(this.messages).map(m => m.speaker).distinct();
	}
}