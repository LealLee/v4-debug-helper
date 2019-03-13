const config = require('./config.json');
const rp = require('request-promise');
const cheerio = require('cheerio');

const hackUrlReg = /^https?:\/\/.*(\.bwtsi\.cn|\.tradeshift\.com|10\.133\.\d+\.\d+:8080)\/v4\/apps\/\w+\.\w+$/;

const getConfigScript = html => html.match(/<script type="text\/javascript">\s+var __config = \{.+\};\s+<\/script>/)[0];

const getAppNameFromUrl = requestUrl => requestUrl.match(/Tradeshift\..+/)[0].replace('Tradeshift.', '');

// 重新组织config.json里面的config.redirectV4AppIndexUrl数据
// 返回值类型是{'DEFAULT': 'redirect_url', appName: 'redirect_url', ...}
const prepareRedirectData = () => {
    const appUrlMap = {};
    Object.keys(config.redirectV4AppIndexUrl).forEach(url => {
        config.redirectV4AppIndexUrl[url].forEach(appName => appUrlMap[appName] = url);
    });
    return appUrlMap;
};

const appRedirectMapping = prepareRedirectData();

const getRedirectUrl = sourceUrl => {
    const appName = getAppNameFromUrl(sourceUrl);
    return appRedirectMapping[appName] || appRedirectMapping['DEFAULT'];
}

const insertConfig = (html, configScript, redirectIndex) => {
    const $ = cheerio.load(html, {xmlMode: true});
    $('body').prepend(configScript);
    $('*').each((index, element) => {
        if (element.name === 'script') {
            const attrSrc = $(element).attr('src');
            if (attrSrc && (attrSrc.indexOf('/webpack') === 0 || attrSrc.indexOf('/locale.js') === 0 || attrSrc.indexOf('/bundles') === 0)) {
                $(element).attr('src', redirectIndex + attrSrc);
            }
        }
        if (!$(element).html()) {
            $(element).html(' ');
        }

    });
    return $.html();
};

module.exports = {
    summary: 'a rule to replace app index',
    *beforeSendResponse(requestDetail, responseDetail) {

        if(hackUrlReg.test(requestDetail.url)) {
            const redirectIndex = getRedirectUrl(requestDetail.url)
            const newResponse = responseDetail.response;
            const body = newResponse.body.toString();
            const originalConfigScript = getConfigScript(body);
            const redirectAppUrl = redirectIndex + requestDetail.requestOptions.path.replace('/v4','');
            const logStr = `redirect ${requestDetail.url} to ${redirectAppUrl}`;

            console.time(logStr);
            console.info('start ' + logStr);

            return rp(redirectAppUrl).then(html => {
                let newRedirectHtml = html.replace('__config', '__configOriginal');
                newResponse.body = insertConfig(newRedirectHtml, originalConfigScript, redirectIndex);
                console.timeEnd(logStr);
                return {response: newResponse};
            }).catch(err => {
                console.error(`request ${redirectAppUrl} error: `, err.message)
            });
        }
    }
};
