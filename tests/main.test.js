const assert = require('assert');
const Robots = require('../src/robots');
const Retriever = require('../src/retrieve');
const fs = require('fs');

describe('Robots', () => {
    const rawRobots = fs.readFileSync(`${__dirname}/raw/robots.txt`).toString('utf-8');
    const robots = new Robots('https://www.ibragim.fr', true, rawRobots);


    it('should check access for a restricted path', async () => {
        await robots.init()
        let access = robots.canCrawl('/wp-admin/dashboard.php', 'GoogleBot');
        assert.deepStrictEqual(access, false);
    });

    it('should check access for a authorized path', async () => {
        let access = robots.canCrawl('/profil', 'GoogleBot');
        assert.deepStrictEqual(access, true);
    });

    it('should check access for a unique bot', async () => {
        let access = robots.canCrawl('/wp-admin/bo-dashboard', 'GoogleBot');
        assert.deepStrictEqual(access, false);

        access = robots.canCrawl('https://www.ibragim.fr/wp-admin/bo-dashboard', 'Custom/Bot');
        assert.deepStrictEqual(access, true);
    });

    it('should check crawl delay for a unique bot', async () => {
        let delay = robots.getCrawlDelay('Custom/Bot');

        assert.deepStrictEqual(delay, 5);
    });
})
