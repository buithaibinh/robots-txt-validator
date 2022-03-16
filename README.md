robots-txt-validator
====================
> Lightweight robots.txt parsing validator **without any external dependencies** for **Node.js**.

Installation
------------
Via NPM

    npm install robots-txt-validator --save


Getting started
---------------
Before using the parser, you need to initialize it like below:
```js
const RobotsParser = require('robots-txt-validator');
...

let robots = new RobotsParser('https://www.example.com', true) // allowOnNeutral = true
await robots.init() // Will attempt to retrieve the robots.txt file natively and parse it.
```

#### Check for allowance and other usages:
```js
let robots = new RobotsParser('https://www.example.com', true) // # allowOnNeutral = true
await robots.init() // # Will attempt to retrieve the robots.txt file natively and parse it.


userAgent = '*'
if (robots.canCrawl(url, userAgent)) { // # Will check the url against all the rules found in robots.txt file
    // # Your logic
}

// # get the crawl delay for a user agent
let crawlDelay = robots.getCrawlDelay('Bingbot')

// # get raw robots.txt content
let content = robots.getRawContent()
```

API
---

### Robots


#### `constructor(url, allowOnNeutral = true, rawRobotsTxt = null)`
`url`: domain of which robots.txt file you want to use.

`allowOnNeutral`: if the same amount of allows and disallows exist for the a url, do we allow or disallow ?

`rawRobotsTxt`: if you already have retrieved the raw robots.txt content, provide it here.


#### `async init()`
**void**

Must be called and awaited before performing any other action.
This method attempts to retrieve the robots.txt file from the provided url.


#### `getRawContent()`
**string | null**

This method returns the raw robots.txt file content.


#### `canCrawl(url, userAgent)`
**boolean**

Checks the rules for the url path and the user agent in the robots.txt file and returns access policy.


#### `getCrawlDelay(userAgent)`
**integer**

Checks if `crawl-delay` is defined for the user agent and returns it if defined, if not, returns `0`.




LICENSE
-------

    MIT License

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
