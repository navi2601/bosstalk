"use strict";
import Sequence from "./sequence";

export interface ConvoMessage {
	speaker: string;
	message: string;
}

export class Conversation {
	uploadTime: Date;
	context: string;
	messages: ConvoMessage[];

	constructor() {
		this.uploadTime = new Date();
		this.context = "";
		this.messages = [];
	}

	get parties(): Iterable<string> {
		return Sequence.fromArray(this.messages).map(m => m.speaker).distinct();
	}
}