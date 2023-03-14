const { resolve } = require("path");

module.exports = {
	context: resolve(__dirname),
	entry: {
		main: "./react.test.tsx",
	},
	builtins: {
		html: [{ template: "./react.test.html" }],
	},
	output: {
		filename: "main.js",
		path: resolve(__dirname, "dist"),
	},
	devServer: {
		port: 16972,
	},
};
