const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopywebpackPlugin = require('copy-webpack-plugin');

// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';


module.exports = {
	mode: 'production',//可以设置为none、development或者production三种模式，如果不设置、默认为production
	
	context: __dirname,
	entry: {
		app: './src/index.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'release'),
	},
	amd: {
		// Enable webpack-friendly use of require in Cesium
		toUrlUndefined: true
	},
	node: {
		// Resolve node module use of fs
		fs: 'empty',
		Buffer: false,
        http: "empty",
        https: "empty",
        zlib: "empty"
	},
	resolve: {
		alias: {
			// CesiumJS module name
			cesium: path.resolve(__dirname, cesiumSource)
		},
		mainFields: ['module', 'main']
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: ['style-loader', 'css-loader']
		}, {
			test: /\.(png|gif|jpg|jpeg|svg|xml|json|glb)$/,
			use: ['url-loader']
		}, {
            // Remove pragmas
            test: /\.js$/,
            enforce: 'pre',
            include: path.resolve(__dirname, cesiumSource),
            sideEffects: false,
            use: [{
                loader: 'strip-pragma-loader',
                options: {
                    pragmas: {
                        debug: false
                    }
                }
            }]
        }]
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]cesium/,
					name: 'Cesium',
					chunks: 'all'
				}
			}
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/index.html'
		}),
		// Copy Cesium Assets, Widgets, and Workers to a static directory
		new CopywebpackPlugin([{ from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' }]),
		new CopywebpackPlugin([{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }]),
		new CopywebpackPlugin([{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }]),
		
		new webpack.DefinePlugin({
			// Define relative base path in cesium for loading assets
			CESIUM_BASE_URL: JSON.stringify('')
		})
	]
};