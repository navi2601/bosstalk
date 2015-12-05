var webpack = require("webpack");
module.exports = {
	entry: {
		app: "./public/ts/app.tsx"
	},
	output: {
		path: "./public/js",
		filename: "[name].entry.js"
	},
	devtool: "source-map",
	resolve: {
		extensions: ["", ".webpack.js", ".web.js", ".js", ".ts", ".tsx"]
	},
	module: {
		loaders: [
			{ test: /\.tsx?$/, loader: "ts-loader" }
		]
	}
};