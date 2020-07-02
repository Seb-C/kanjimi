var path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	target: 'web',
	mode: process.env.NODE_ENV,
	resolve: {
		extensions: ['.ts', '.js'],
		modules: [
			path.resolve('./src'),
			path.resolve('./node_modules'),
		],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: [/node_modules/, /src\/Server/],
				use: {
					loader: "ts-loader",
					options: {
						appendTsSuffixTo: [/\.vue$/]
					}
				},
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.css$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					}, {
						loader: 'css-loader',
					},
				],
			},
		],
	},
	entry: {
		main: './src/Extension/main.ts',
	},
	output: {
		path: path.resolve('./dist/extension'),
		filename: 'content.build.js',
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'content.build.css',
		}),
		new webpack.DefinePlugin(
			Object.fromEntries(
				Object.keys(process.env).map((key) => (
					[`process.env.${key}`, JSON.stringify(process.env[key])]
				)),
			),
		),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve('./src/Extension/manifest.json'),
					to: path.resolve('./dist/extension/manifest.json'),
					transform(content) {
						let modifiedContent = content.toString();
						Object.keys(process.env).forEach((key) => {
							modifiedContent = modifiedContent.replace(
								new RegExp(`\{\{ *${key} *\}\}`, 'g'),
								process.env[key],
							);
						});
						return new Buffer(modifiedContent);
					},
				},
			],
		}),
	],

	// Makes mini-css-extract-plugin output everything in a single file
	optimization: {
		splitChunks: {
			cacheGroups: {
				styles: {
					name: 'styles',
					test: /\.css$/,
					chunks: 'all',
					enforce: true,
				},
			},
		},
	},
};
