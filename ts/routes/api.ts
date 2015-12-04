"use strict";
import * as express from "express";

const router = express.Router();
export default router;

router.get("/version", (req, res) => {
	res.json({
		version: "1.0"
	});
});