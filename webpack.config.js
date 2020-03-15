var path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const server = {
// 	target: 'node',
// 	mode: 'production',
// 	optimization: {
// 		minimize: false
// 	},
// 	resolve: {
// 		extensions: ['.ts', '.js', '.tsx', '.jsx'],
//		modules: [
//			path.resolve('./src'),
//			path.resolve('./node_modules'),
//		],
// 	},
// 	plugins: [
// 		new webpack.IgnorePlugin(/^pg-native$/),
// 	],
// 	stats: {
// 		warningsFilter: "pg-promise",
// 		chunkModules: true,
// 		modules: false,
// 		hash: false,
// 		entrypoints: false,
// 		version: false,
// 		builtAt: false,
// 		assets: false,
// 		timings: false,
// 	},
// 	module: {
// 		rules: [
// 			{
// 				test: /\.tsx?$/,
// 				use: 'ts-loader',
// 				exclude: /node_modules/,
// 			}
// 		]
// 	},
// 	entry: {
// 		main: './src/main.ts',
// 	},
// 	output: {
// 		path: path.resolve(__dirname, './build'),
// 		filename: '[name].js',
// 	}
// };

const extensionContent = {
	target: 'web',
	mode: 'production',
	resolve: {
		extensions: ['.ts', '.js', '.tsx', '.jsx'],
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
		main: './src/Client/extensionContent.ts',
	},
	output: {
		path: path.resolve(__dirname, './extension'),
		filename: 'content.build.js',
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'content.build.css',
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

module.exports = [
	// server,
	extensionContent,
];
