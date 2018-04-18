# Bloxciting

> Bloxciting is an simple exciting blog system.

Bloxciting serves markdown file as blog and directory as category.
It will watch file changes and update etag for caching.
It use client-rendering to display blog content.

## Usage

Write config file `bloxciting.config.json`.

```bash
npm i bloxciting
```

```js
// index.js
const bloxciting = require('bloxciting')

bloxciting.serveAssets()
bloxciting.serveHomePage()
bloxciting.setLoggerLevel('trace')

bloxciting.start()
```

Then you can write blogs in markdown.

See /example

## Config File

```js
// bloxciting.config.json
{
  "app": {
    "blog-home": "blog-home",   // This is the home dir of blog files.
    "port": 18888               // bloxciting will start a koa service listening this port, default is 18888.
  },
  "author": {
    "nickname": "D·Jagger",
    "email": "634750802@qq.com",
    "signature": "Front-end developer, feeling excited in Vue.js and all great front end projects."
  }
}
```

## API

. | .
- | :-
Method | GET
URL | /api/v1/blogs/path/to/blogOrCategory
Returns | String, Object
Description | If returns string, the content is blog content(in html). Otherwise, the content is a category object.

