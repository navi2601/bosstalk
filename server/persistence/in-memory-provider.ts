"use strict";
import {Conversation} from "../models/conversation";
import seq from "../models/sequence";
import {PersistenceProvider, ConversationRepo} from "./interfaces";

export default class InMemoryPersistenceProvider implements PersistenceProvider {
	private convoRepo = new InMemoryConversationRepo();

	createConversationRepo(): ConversationRepo {
		return this.convoRepo;
	}
}

class InMemoryConversationRepo implements ConversationRepo {
	private storage: Conversation[];
	private nextId: number;

	constructor() {
		this.storage = [];
	}

	create(entity: Conversation): Promise<string>{
		return new Promise<string>((resolve, reject) => {
			const newId = this.nextId.toString(16);
			this.nextId++;
			entity.id = newId;
			this.storage.push(entity);
			resolve(newId);
		});
	}

	fetch(id: string): Promise<Conversation>{
		return new Promise<Conversation>((resolve, reject) => {
			const index = this.storage.findIndex(c => c.id == id);
			if (index >= 0 && index < this.storage.length) {
				resolve(this.storage[index]);
			}
			else {
				reject("Invalid entity ID");
			}
		});
	}

	fetchConversations(skip: number, count: number): Promise<Conversation[]>{
		return new Promise<Conversation[]>((resolve, reject) => {
			resolve(seq(this.storage).reverse().skip(skip).take(count).toArray());
		});
	}

	update(id: string, entity: Conversation): Promise<any>{
		return new Promise<any>((resolve, reject) => {
			const index = this.storage.findIndex(c => c.id == id);
			if (index >= 0 && index < this.storage.length) {
				this.storage[index] = entity;
				resolve(null);
			}
			else {
				reject("Invalid entity ID");
			}
		});
	}

	delete(id: string): Promise<any>{
		return new Promise<any>((resolve, reject) => {
			const index = this.storage.findIndex(c => c.id == id);
			if (index >= 0 && index < this.storage.length) {
				this.storage.splice(index, 1);
				resolve(null);
			}
			else {
				reject("Invalid entity ID");
			}
		});
	}
}