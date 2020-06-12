var path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	target: 'web',
	mode: 'development',
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
				exclude: /node_modules/,
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
				options: {
					transformAssetUrls: {
						video: null,
						source: null,
						img: null,
						image: null,
						use: null,
					},
				},
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
		main: './src/WebApp/main.ts',
	},
	output: {
		path: path.resolve('./www'),
		filename: 'js/app.build.js',
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'css/app.build.css',
		}),
		new webpack.DefinePlugin(
			Object.fromEntries(
				Object.keys(process.env).map((key) => (
					[`process.env.${key}`, JSON.stringify(process.env[key])]
				)),
			),
		),
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