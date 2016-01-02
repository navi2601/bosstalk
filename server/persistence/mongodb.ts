import {default as entity, MongooseEntityPackage} from "./mongoose-wrapper";
import {Talk, Discussion} from "../models/talk";
import * as mongoose from "mongoose";

const talkModel: MongooseEntityPackage<Talk> = entity<Talk>("talk", {
    timestamp: Date,
    title: String,
    context: String,
    messages: [{
        speaker: String,
        content: String
    }]
});

const discussionModel: MongooseEntityPackage<Discussion> = entity<Discussion>("discussion", {
    talkId: mongoose.Types.ObjectId,
    entries: [{
        poster: String,
        timestamp: Date,
        content: String
    }]
});

export { talkModel, discussionModel };
