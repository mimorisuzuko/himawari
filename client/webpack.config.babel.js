import webpack from 'webpack';
import libpath from 'path';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import ButternutWebpackPlugin from 'butternut-webpack-plugin';

const dst = 'app/dst';
const context = libpath.join(__dirname, 'src');

export default {
	entry: context,
	output: {
		path: libpath.join(__dirname, dst),
		filename: 'index.js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['react'],
						plugins: [
							'transform-decorators-legacy',
							['react-css-modules',
								{
									context,
									generateScopedName: '[name]__[local]',
									filetypes: {
										'.scss': {
											syntax: 'postcss-scss'
										}
									}
								}]
						]
					}
				}
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader?importLoader=1&modules&localIdentName=[name]__[local]',
					'sass-loader'
				]
			},
		]
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	plugins: [
		new CleanWebpackPlugin([dst], {
			root: __dirname,
			verbose: false,
			dry: false,
			exclude: ['index.html', 'index.css']
		}),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new ButternutWebpackPlugin({})
	],
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM',
		'lodash': '_'
	},
	node: {
		__filename: false,
		__dirname: false
	},
	target: 'electron'
};