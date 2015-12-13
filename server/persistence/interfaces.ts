import {Entity} from "../models/entity";
import {Conversation} from "../models/conversation";

export interface PersistenceProvider {
	createConversationRepo(): ConversationRepo;
}

export interface Repository<T extends Entity> {
	create(entity: T): Promise<string>;
	fetch(id: string): Promise<T>;
	update(id: string, entity: T): Promise<any>;
	delete(id: string): Promise<any>;
}

export interface ConversationRepo extends Repository<Conversation>{
	fetchConversations(skip: number, count: number): Promise<Conversation[]>;
}