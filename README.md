# v4-debug-helper

本项目主要目的是为了在用本地的前端的V4资源来替代`testing`,`sandbox`或者`production`等线上环境的V4资源，有下面几个好处：

* 线上环境的前端资源的经过压缩混淆的，本地环境的资源可以是非混淆的，在排查bug时可以相对容易定位
* 当本地修改完代码后，可以迅速的用线上的数据进行测试
* 。。。

支持所有通过V4构建的项目，希望可以给前端同学们带来一点帮助。

## 安装

这是一个非常简单的NodeJs项目，所以
```
npm install
```
## 启动

1. 首先修改`config.json`文件里面`redirectV4AppIndexUrl`配置,

```
"redirectV4AppIndexUrl": {
    "http://localhost:8321": [
        "DEFAULT"
    ],
    "http://localhost:8844": [
        "FapiaoManager",
        "CNPayTenantAdmin",
        ......
    ],
    "http://localhost:8102": [
        "BrandhouseLogisticsManager", 
        "PriceComparison", 
        ...
    ]
}
```
- `redirectV4AppIndexUrl`里面的key是本地V4项目的启动端口
- key对应的数组里面值是你想要debug的app的id.
- 如果在所有的数组中都没找到当前的appid, 那么默认用`DEFULAT`对应的转发地址`http://localhost:8321` 


2. 运行`npm start`，将会启动两个端口
* 8001: http(s)代理服务器端口
* 8002: 代理服务器web配置页面端口

## 使用
1. 安装证书

    1.1 生成证书
        运行`npx anyproxy-ca`, 然后自动打开证书目录。

    1.2 信任证书
        参考 [OSX系统信任CA证书](http://anyproxy.io/cn/#osx%E7%B3%BB%E7%BB%9F%E4%BF%A1%E4%BB%BBca%E8%AF%81%E4%B9%A6)
    

2. 为浏览器设置代理

    方法很多，自己装吧，推荐用插件，比如[Chrome Proxy SwitchySharp](https://chrome.google.com/webstore/detail/proxy-switchysharp/dpplabbmogkhghncfbfdeeokoefdjegm?hl=zh-CN)

3. 本地启动V4 APP

4. 完成！此事访问线上的V4 APP,将会使用本地的已经启动的V4 APP。

Enjoy!

