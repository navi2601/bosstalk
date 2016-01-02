"use strict";
import {Document, Schema, model, Model} from "mongoose";

export type EntityDocument<T> = T & Document;

export interface MongooseEntityPackage<T extends Object> {
    (data?: T): EntityDocument<T>;
    schema: Schema;
    entityCtor: Model<EntityDocument<T>>;
    entityName: string;
}

export default function entity<T extends Object>(name: string, schemaObj: Object): MongooseEntityPackage<T> {
    const schema = new Schema(schemaObj);
    const ctor = model<EntityDocument<T>>(name, schema);
    const factory = <MongooseEntityPackage<T>> function(data?: T): EntityDocument<T> {
        return new ctor(data);
    };
    
    factory.entityCtor = ctor;
    factory.schema = schema;
    factory.entityName = name;
    return factory;
}
