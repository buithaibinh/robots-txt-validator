const USER_AGENT = 'user-agent';
const ALLOW = 'allow';
const DISALLOW = 'disallow';
const SITEMAP = 'sitemap';
const CRAWL_DELAY = 'crawl-delay';
const HOST = 'host';

const comments = /#.*$/gm;
const whitespace = ' ';
const lineEndings = /[\r\n]+/g;

class Parser {

    constructor (rawRobotsContent) {
        this.instances = {};
        this.sitemaps = [];
        this.host = null;
        this.init(rawRobotsContent);
    }

    init(content) {
        let lines = Parser.splitLines(Parser.cleanStrings(content));

        let agent = '';
        for (let i = 0; i < lines.length; i++) {
            let line = Parser.parseLine(lines[i]);

            switch (line.type) {
                case USER_AGENT:
                    agent = line.value.toLowerCase();
                    if (agent.length > 0) {
                        this.instances[agent] = {
                            rules: [],
                            crawlDelay: 0
                        };
                    }
                    break;

                case ALLOW:
                    if (agent.length > 0 && line.value != null && line.value.length > 0) {
                        // this.instances[agent].allow.push()
                        let parsedRule = Parser.groupMemberLine(line.value);
                        let rule = {
                            directive: ALLOW,
                            specificity: parsedRule.specificity,
                            path: parsedRule.path
                        };

                        this.addRule(agent, rule);
                    }
                    break;

                case DISALLOW:
                    if (agent.length > 0 && line.value != null && line.value.length > 0) {
                        // this.instances[agent].disallow.push(Parser.groupMemberLine(line.value))
                        let parsedRule = Parser.groupMemberLine(line.value);
                        let rule = {
                            directive: DISALLOW,
                            specificity: parsedRule.specificity,
                            path: parsedRule.path
                        };

                        this.addRule(agent, rule);
                    }
                    break;

                case SITEMAP:
                    if (line.value != null && line.value.length > 0) {
                        this.sitemaps.push(line.value);
                    }
                    break;

                case CRAWL_DELAY:
                    if (agent.length > 0 && line.value != null) {
                        this.instances[agent].crawlDelay = Number.parseInt(line.value, 10);
                    }
                    break;

                case HOST:
                    if (this.host == null && line.value != null && line.value.length > 0) {
                        this.host = line.value;
                    }
                    break;

                default:
                    break;
            }
        }

        this.sitemaps = this.sitemaps.filter((val, i, s) => s.indexOf(val) === i);
    }

    addRule(agent, rule) {
        this.instances[agent].rules.push(rule);
    }

    getInstanceForUserAgent(userAgent) {
        if (this.instances[userAgent] == undefined) {
            return null;
        }

        return this.instances[userAgent];
    }

    findLinesForUserAgent(userAgent) {
        if (this.instances[userAgent] == undefined) {

            if (this.instances['*'] == undefined) {
                return [];
            }

            return this.instances['*'];
        }

        return this.instances[userAgent];
    }

    static cleanStrings(rawString) {
        return rawString
            .replace(comments, '')
            .replace(whitespace, '')
            .trim();
    }

    static splitLines(rawString) {
        return rawString.split(lineEndings);
    }

    static parseLine(line) {
        let splitIndex = line.indexOf(':');

        let payload = {
            type: line.slice(0, splitIndex).toLowerCase().trim(),
            value: line.slice(splitIndex + 1).trim()
        };

        return payload;
    }

    static parsePattern(pattern) {
        let regexSpecialChars = /[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g;
        let wildCardPattern = /\*/g;
        let EOLPattern = /\\\$$/;
        let flags = 'm';

        let regexStr = pattern
            .replace(regexSpecialChars, '\\$&')
            .replace(wildCardPattern, '.*')
            .replace(EOLPattern, '$');

        return new RegExp(regexStr, flags);
    }

    static groupMemberLine(value) {
        return {
            specificity: value.length,
            path: Parser.parsePattern(value)
        };
    }
}

module.exports = Parser;
