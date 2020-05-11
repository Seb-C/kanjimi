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
		path: path.resolve(__dirname, './extension'),
		filename: 'content.build.js',
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'content.build.css',
		}),
		new webpack.DefinePlugin({
			"process.env.KANJIMI_API_URL": JSON.stringify(process.env.KANJIMI_API_URL),
			"process.env.KANJIMI_WWW_URL": JSON.stringify(process.env.KANJIMI_WWW_URL),
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
