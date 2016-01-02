"use strict";
import {Document, Schema, model, Model} from "mongoose";

export type EntityDocument<T> = T & Document;
export type EntityModel<T> = Model<EntityDocument<T>> & { new (data?: T): EntityDocument<T> };

export default function entity<T extends Object>(name: string, schemaObj: Object): EntityModel<T> {
    const schema = new Schema(schemaObj);
    const ctor = model<EntityDocument<T>>(name, schema);
    return <EntityModel<T>>ctor;
}
