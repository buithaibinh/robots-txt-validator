function prepareUrl(link) {
    let url = new URL(link);
    url.search = '';
    url.searchParams = new URLSearchParams({});
    url.hash = '';
    url.pathname = '';
    url.port = '';
    url.username = '';
    url.password = '';

    url.pathname = '/robots.txt';

    return url;
}


async function makeRequest(handler, link) {
    return await new Promise(resolve => {
        handler.get(link, res => {
            if (res.statusCode === 301) {
                let locationHeader = res.headers['location'];

                if (locationHeader !== '' || locationHeader !== null || locationHeader !== undefined) {
                    resolve({ redirection: true, location: locationHeader });
                }
            }

            if (res.statusCode !== 200) {
                console.log(`[error] ${res.statusCode}`);
                resolve(null);
            }

            res.setEncoding('utf8');

            res.on('data', body => {
                resolve(body);
            })
        })
    })
}

module.exports = async (link) => {

    let url = prepareUrl(link);
    let robotsLink = url.toString();

    let request = null;
    if (url.protocol.startsWith('https')) {
        request = require('https');
    } else {
        request = require('http');
    }

    let response = await makeRequest(request, robotsLink);
    if (typeof response === 'string') {
        return response;
    }

    // default robots.txt
    let rawContent = `User-agent: *
Allow: /`;
    if (response !== null && typeof response === 'object') {
        if (response.redirection === true) {
            link = response.location;

            url = prepareUrl(link);
            if (url.protocol.startsWith('https')) {
                request = require('https');
            } else {
                request = require('http');
            }

            response = await makeRequest(request, url.toString());
            if (typeof response === 'string') {
                rawContent = response;
            }
        }
    }

    return rawContent;
}
