"use strict";
import * as express from "express";

const app = express();
app.use(express.static("public"));

const server = app.listen(process.env.PORT || 1337, () =>{
	console.log(`Boss is listening at port: ${server.address().port}`);
});