"use strict";

import {default as entity} from "./mongoose-wrapper";
import {Talk, Discussion} from "../models/talk";
import * as mongoose from "mongoose";

const talkModel = entity<Talk>("talk", {
    timestamp: Date,
    title: String,
    context: String,
    messages: [{
        speaker: String,
        content: String
    }]
});

const discussionModel = entity<Discussion>("discussion", {
    talkId: mongoose.Types.ObjectId,
    entries: [{
        poster: String,
        timestamp: Date,
        content: String
    }]
});

export { talkModel, discussionModel };
