///<reference path="./typings/index.d.ts"/>
var fs = require("fs");
var fse = require("fs-extra");
var childProc = require("child_process");
var path = require("path");

function shell(command, args) {
    return new Promise((resolve, reject) => {
        console.log("executing " + command);
        
        var process = childProc.spawn(command, args, {stdio: "inherit"});
        process.on("close", function (code, signal) {
            console.log("process exited with code " + code);
            if (code > 0) {
                reject("process " + command + " exited with code " + code);
            }
            else {
                resolve({code: code, signal: signal});
            }
        });
    });
}

function cleanDir(dir) {
    return new Promise((resolve, reject) => {
        fse.emptyDir(dir, function (err) {
            if (err) {
                reject(err);
            } 
            else {
                resolve(true);
            }
        });
    });
}

desc("add node modules bin folder to path");
task("set-path", function () {
    var paths = process.env.PATH.split(":");
    var binDir = path.join(__dirname, "node_modules/.bin");
    var filter = paths.filter(function (path) {
        return path === binDir;
    });
    
    if (filter.length == 0) {
        paths.push(binDir);
        process.env.PATH = paths.join(":");
    }
});

desc("Clean up server artifacts");
task("clean-server-lib", {async: true}, function () {
    cleanDir("lib").then(function () {
        complete();
    }).catch(function (err) {
        fail(err);
    });
})

desc("Clean up client generated js files");
task("clean-client-js", {async: true}, function () {
    cleanDir("public/lib/js").then(function() {
        complete();
    }).catch(function (err) {
        fail(err);
    });
});

desc("Clean up client generated css files");
task("clean-client-css", {async: true}, function () {
    cleanDir("public/lib/css").then(function () {
        complete();
    }).catch(function (err) {
        fail(err);
    });
});

desc("Clean up project");
task("clean", ["clean-server-lib", "clean-client-js", "clean-client-css"], function (){ });

desc("Install typings");
task("install-typings", {async: true}, function () {
    shell("typings", ["install"]).then(function (){
        complete();
    }).catch(function (err){
        fail("failed to invoke typings");
    })
});

desc("Compile server TypeScript files");
task("build-server-tsc", ["clean-server-lib", "set-path", "install-typings"], {async: true}, function () {
    shell("tsc", []).then(function () {
        complete();
    }).catch(function (err) {
        fail("failed to invoke tsc");
    });
});

desc("Build server");
task("build-server", ["build-server-tsc"], function () {
    console.log("");
});

desc("Compile SASS style sheets");
task("build-sass", ["clean-client-css", "set-path"], {async: true}, function () {
    shell("sass", ["public/sass/main.scss", "public/lib/css/main.css", "--style", "compressed"]).then(function (){
        complete();
    }).catch(function (err) {
        fail("failed to invoke sass"); 
    });
});

desc("Compile client TypeScript files");
task("build-client-tsc", ["clean-client-js", "set-path", "install-typings"], {async: true}, function (){
    shell("webpack", []).then(function () {
        complete();
    }).catch(function (err){
        fail("failed to invoke webpack");
    });
});

desc("Build client");
task("build-client", ["build-client-tsc", "build-sass"], function () { });

desc("Build");
task("build", ["build-server", "build-client", "test"], function () {});

desc("Run tests");
task("test", ["build-server", "set-path"], {async: true}, function () {
    shell("mocha", ["lib/tests"]).then(function (){
        complete();
    }).catch(function (err) {
        fail("failed to run mocha tests");
    });
});