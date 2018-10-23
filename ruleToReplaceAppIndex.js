const config = require('./config.json');
const rp = require('request-promise');
const cheerio = require('cheerio');
const redirectV4Config = {
    index: config.redirectV4AppIndexUrl
};

const hackUrlReg = /^https:\/\/.+\.bwtsi\.cn\/v4\/apps\/\w+\.\w+$/;

const getConfigScript = html => html.match(/<script type="text\/javascript">\s+var __config = \{.+\};\s+<\/script>/)[0];

const insertConfig = (html, configScript) => {
    const $ = cheerio.load(html, {xmlMode: true});
    $('body').prepend(configScript);
    $('script').each((index, element) => {
        const attrSrc = $(element).attr('src');
        if(attrSrc && (attrSrc.indexOf('/webpack') === 0 || attrSrc.indexOf('/locale.js') === 0)){
            $(element).html(' ');
            $(element).attr('src', redirectV4Config.index + attrSrc);
        }
    });
    return $.html();
};

module.exports = {
    summary: 'a rule to replace app index',
    *beforeSendResponse(requestDetail, responseDetail) {

        if(hackUrlReg.test(requestDetail.url)) {
            const newResponse = responseDetail.response;
            const body = newResponse.body.toString();
            const originalConfigScript = getConfigScript(body);
            const redirectAppUrl = `${redirectV4Config.index}${requestDetail.requestOptions.path.replace('/v4','')}`;
            const logStr = `redirect ${requestDetail.url} to ${redirectAppUrl}`;

            console.time(logStr);
            console.info('start ' + logStr);

            return rp(redirectAppUrl).then(html => {
                let newRedirectHtml = html.replace('__config', '__configOriginal');
                newResponse.body = insertConfig(newRedirectHtml, originalConfigScript);
                console.timeEnd(logStr);
                return {response: newResponse};
            }).catch(err => {
                console.error(`request ${redirectAppUrl} error: `, err.message)
            });
        }
    }
};
