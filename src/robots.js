const Retrieve = require('./retrieve');
const Parser = require('./parser');

class Robots {
    constructor(url, allowOnNeutral = true, rawRobotsTxt = null) {
        this.url = this._parseUrl(url, false);
        this.allowOnNeutral = allowOnNeutral;
        this.rawRobots = rawRobotsTxt;
        this.parser = null;
    }

    _parseUrl(url, asObject = true) {
        if (url == null) {
            throw new Error('"url" cannot be null, it must be a valid http url.');
        }

        if (!url.startsWith('http')) {
            url = `http://${url}`;
        }

        if (!asObject) {
            return url;
        }

        return new URL(url);
    }

    async init() {
        if (this.rawRobots == null) {
            this.rawRobots = await Retrieve(this.url);
        }

        if (this.rawRobots != null && this.parser == null) {
            this.parser = new Parser(this.rawRobots);
        }
    }

    getRawContent() {
        return this.rawRobots;
    }

    canCrawl(url, userAgent) {
        if (this.parser === null) {
            throw new Error('[error] You must call the "init" function before performing any operations.');
        }

        userAgent = userAgent.toLowerCase();

        let instance = this.parser.findLinesForUserAgent(userAgent);

        let {allows, disallows, maxAllowSpec, maxDisallowSpec} = this._applyLines(url, instance);
        let noAllows = allows === 0 && disallows > 0;
        let noDisallows = allows > 0 && disallows === 0;

        if (allows === 0 && disallows === 0) {
            return true;
        }

        if (noDisallows || (maxAllowSpec > maxDisallowSpec)) {
            return true;
        } else if (noAllows || (maxAllowSpec < maxDisallowSpec)) {
            return false;
        }

        return this.allowOnNeutral;
    }

    getCrawlDelay(userAgent) {
        let instance = this.parser.getInstanceForUserAgent(userAgent.toLowerCase());
        if (instance === null) {
            return instance;
        }

        return instance.crawlDelay;
    }

    _applyLines(path, instance) {
        let allows = 0;
        let disallows = 0;
        let maxAllowSpec = 0;
        let maxDisallowSpec = 0;

        for (let i = 0; i < instance.rules.length; i++) {
            let rule = instance.rules[i];
            let directive = rule.directive;

            if (directive !== 'allow' && directive !== 'disallow') {
                continue;
            }

            if (rule.path.test(path)) {
                if (directive === 'allow') {
                    allows++;
                    if (rule.specificity > maxAllowSpec) {
                        maxAllowSpec = rule.specificity;
                    }
                } else {
                    disallows++;
                    if (rule.specificity > maxDisallowSpec) {
                        maxDisallowSpec = rule.specificity;
                    }
                }
            }
        }

        return {
            allows,
            disallows,
            maxAllowSpec,
            maxDisallowSpec
        };
    }
}

module.exports = Robots;
