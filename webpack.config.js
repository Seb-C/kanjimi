var path = require('path');
const webpack = require('webpack');

module.exports = {
	target: 'node',
	mode: 'production',
	optimization: {
		minimize: false
	},
	resolve: {
		extensions: ['.ts', '.js', '.tsx', '.jsx'],
	},
	plugins: [
		new webpack.IgnorePlugin(/^pg-native$/),
	],
	stats: {
		warningsFilter: "pg-promise",
		chunkModules: true,
		modules: false,
		hash: false,
		entrypoints: false,
		version: false,
		builtAt: false,
		assets: false,
		timings: false,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}
		]
	},
	entry: {
		main: './src/main.ts',
	},
	output: {
		path: path.resolve(__dirname, './build'),
		filename: '[name].js',
	}
};

