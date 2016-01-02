"use strict";
import * as express from "express";
import apiRoutes from "./routes/api";

import seq from "./utilities/sequence";

const app = express();
app.use(express.static("public"));
app.use("/api/v1", apiRoutes);

const server = app.listen(process.env.PORT || 1337, () => {
    console.log(`Boss is listening at port: ${server.address().port}`);
});
