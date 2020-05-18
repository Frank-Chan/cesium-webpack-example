# cesium-webpack-example
通过[Webpack](https://webpack.js.org/concepts/)使用[Cesium](https://cesiumjs.org/) 的应用程序的最少推荐设置。

## 0. 运行应用程序
	npm install  //安装webpack所需的开发模块（仅在第一次使用没有node模块时执行，后续一般无需重复执行）,或者cnpm install
	npm start   //启动应用程序，浏览器会自动打开`localhost:8080`.

### 可用的脚本

* `npm run build` - 通过`webpack.config.js`运行一个webpack build
* `npm start` - 通过`webpack.config.js`运行一个webpack build同时启动一个web 开发server
* `npm run release` - 通过`webpack.release.config.js`运行一个优化的webpack build
* `npm run serve-release` - 通过`webpack.release.config.js`运行一个优化的webpack build同时启动一个web开发server

### 配置文件说明

在本项目中包括两个webpack配置文件：
* `webpack.config.js`   -包含开发环境的配置信息。
* `webpack.release.config.js`   -则包含用于生产环境的优化后的配置信息。


## 1. 在应用程序中请求Cesium

Cesium官方推荐通过`import`关键字使用[ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) 模块


### 1.1 从Cesium中导入已命名的模块

	import { Color } from 'cesium';
	var c = Color.fromRandom();

### 1.2 导入Cesium的静态资产文件
	
	import "cesium/Build/Cesium/Widgets/widgets.css";

## 2.代码压缩与优化
### 2.1 Treeshaking

`webpack.release.config.js`对CesiumJS模块激活了tree-shaking功能，将会让未使用的模块不被包含到生产环境中。更详细的信息请参考 [Tree Shaking](https://webpack.js.org/guides/tree-shaking) 文档。

##### 移除注记-Removing pragmas

在Cesium的源代码中有开发者的错误和警告提示，在release版本中这些信息通过使用[`strip-pragma-loader`](https://www.npmjs.com/package/strip-pragma-loader)移除了。

通过npm安装插件包

```
npm install strip-pragma-loader --save-dev
```

在`module.rules`中配置上述装载器，同时设置`debug`的值为`false`.
```
rules: [{
	test: /\.js$/,
	enforce: 'pre',
	include: path.resolve(__dirname, cesiumSource),
	use: [{
		loader: 'strip-pragma-loader',
		options: {
		    pragmas: {
				debug: false
			}
		}
	}]
}]
```

## Contributions

开发团队[Cesium](https://cesium.com/).