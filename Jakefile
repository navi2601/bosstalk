var fs = require("fs");
var fse = require("fs-extra");
var childProc = require("child_process");

desc("Clean up project");
task("clean", {async: true}, function (){
    fse.emptyDir("lib", function (err) {
        if (!err) {
            complete();
        }
        else {
            fail(err);
        }
    });
});

desc("Compile server TypeScript files");
task("build-server-tsc", {async: true}, function () {
    childProc.exec("./node_modules/.bin/tsc", function (err, stdout, stderr) {
         if (!err) {
             console.log(stdout.toString());
             complete();
         }
         else {
             console.error(stderr);
             fail(err);
         }
    });
});