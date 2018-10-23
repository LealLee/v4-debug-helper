const config = require('./config.json');
const AnyProxy = require('anyproxy');
/**
 * config url http://anyproxy.io/cn/#%E4%BD%9C%E4%B8%BAnpm%E6%A8%A1%E5%9D%97%E4%BD%BF%E7%94%A8
 */
const options = {
    port: 8001,
    rule: require('./ruleToReplaceAppIndex'),
    webInterface: {
        enable: true,
        webPort: 8002
    },
    dangerouslyIgnoreUnauthorized: true,
    forceProxyHttps: true,
    silent: !config.logRequestToConsole
};
const proxyServer = new AnyProxy.ProxyServer(options);


proxyServer.on('ready', () => {
    console.log(`proxy start on port ${options.port}, web interface is on port ${options.webInterface.webPort}`);
});
proxyServer.on('error', (e) => {
    console.error('proxy server start error ', e)
});
proxyServer.start();
