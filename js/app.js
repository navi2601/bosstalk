"use strict";
var express = require("express");
const app = express();
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.send("Hello Boss!");
});
const server = app.listen(8888, () => {
    const port = server.address().port;
    console.log(`Boss is listening at port: ${port}`);
});
//# sourceMappingURL=app.js.map