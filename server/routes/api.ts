"use strict";
import * as express from "express";
import * as bodyParser from "body-parser";
import {talkModel, discussionModel} from "../persistence/mongodb";
import {optional} from "../utilities/optional";

const router = express.Router();
export default router;

router.get("/version", (req, res) => {
    res.json({
        version: "1.0"
    });
});

router.get("/talks", (req, res) => {
    const from = optional(<number>req.query.from).defaultIfNone(0).value;
    const count = optional(<number>req.query.count).defaultIfNone(20).value;
    const criteria = {};
    
    talkModel.entityCtor.find(criteria).skip(from).limit(count).find((err, talks) => {
        if (optional(err).hasValue) {
            res.json({
                status: "ok",
                result: talks
            });
        }
        else {
            res.json(500, {
                status: "error",
                error: err
            });
        }
    });
});

router.post("/talks", bodyParser.json(), (req, res) => {
    const newTalk = talkModel(req.body);
    newTalk.save((err, ignore) => {
        if (optional(err).hasValue) {
            res.json({
                status: "ok"
            });
        }
        else {
            res.json(500, {
                status: "error",
                error: err
            });
        }
    });
});

router.get("discussions/:talkId", (req, res) => {
    const talkId = optional(req.params.talkId);
    if (talkId.hasValue) {
        const criteria = { talkId: talkId };
        discussionModel.entityCtor.findOne(criteria, (err, discussion) => {
            if (optional(err).hasValue) {
                res.json({
                    status: "ok",
                    result: discussion
                });
            }
            else {
                res.json(500, {
                    status: "error",
                    error: err
                });
            }
        });
    }
    else {
        res.json(500, {
            status: "error",
            error: "The talk identifier associated with the discussion requested is not available."
        });
    }
});
