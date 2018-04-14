# Bloxciting

Bloxciting is an simple exciting blog system.

## Usage

Write config file `bloxciting.config.json`.

```bash
npm i bloxciting
require('bloxciting') // It will start the http server.
```

Then you can write blogs in markdown.

See /example

## Config File

```node
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
