const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const crypto = require('crypto')
const {getLogger} = require('log4js')
const marked = require('./lib/marked')
const parallel = require('./lib/parallel')
const mkdirp = require('mkdirp')

const {File, load, isDirectory} = require('./lib/File')

function resolve (filename) {
  return path.resolve(process.cwd(), filename)
}

const config = require(resolve('bloxciting.config.json'))
const author = config['author']

class BlogController {

  constructor (dir) {
    this.logger = getLogger('BLOG EVENTS')
    this.logger.level = 'trace'
    this.baseDir = path.resolve(dir)
    this.watchDir(dir)
    this.fileCahce = new Map()
    this.distBaseDir = path.resolve(dir, '../.bloxcitingdist')
  }

  watchDir (dir) {
    const watcher = chokidar.watch('**/*.md', {
      persistent: true,

      // ignored: "",
      ignoreInitial: false,
      followSymlinks: true,
      cwd: dir,
      disableGlobbing: false,

      usePolling: false,
      // interval: 1000,
      // binaryInterval: 300,
      alwaysStat: false,
      depth: 99,
      awaitWriteFinish: {
        stabilityThreshold: 2000
        // pollInterval: 100
      },

      ignorePermissionErrors: false,
      atomic: true // or a custom 'atomicity delay', in milliseconds (default 100)
    })
    watcher.on('add', path => this.onAddFile(path)).
      on('change', path => this.onFileChanged(path)).
      on('unlink', path => this.onFileRemoved(path))

// More possible events.
    watcher.
      // on('addDir', path => this.logger.trace(`Directory ${path} has been added`)).
      // on('unlinkDir', path => this.logger.trace(`Directory ${path} has been removed`)).
      on('error', error => this.logger.error('[File Watcher error]', error)).
      on('ready', () => this.logger.info('[File Watcher ready]'))
  }

  async onAddFile (filepath) {
    const blog = load(filepath, this.baseDir)
    this.fileCahce.set(filepath, blog)
    blog.title = path.basename(filepath, '.md')
    blog.compiledFile = File.create(filepath + '.compiled', this.distBaseDir)
    await parallel.all(
      async () => {
        blog.hash = await blog.md5Hash()
      },
      () => blog.compile(blog.compiledFile.path, marked, {author}))
    blog.refresh()
    blog.compiledFile.refresh()
    this.logger.trace(
      `[Blog Initialize]: ${blog.title} (${blog.size}B, MD5 HASH: ${blog.hash})`)
  }

  onFileRemoved (path) {
    const blog = this.fileCahce.get(path)
    this.fileCahce.delete(path)
    if (blog) {
      this.logger.trace(
        `[Blog Removed]: ${blog.title} (${blog.size}B, MD5 HASH: ${blog.hash})`)
    }
  }

  async onFileChanged (path) {
    const blog = this.fileCahce.get(path)
    if (blog) {
      const oldHash = blog.hash
      const oldSize = blog.size
      await parallel.all(
        async () => {
          blog.hash = await blog.md5Hash()
        },
        () => blog.compile(blog.compiledFile.path, marked))
      blog.refresh()
      blog.compiledFile.refresh()
      this.logger.trace(
        `[Blog Updated]: ${blog.title} (${oldSize}B => ${blog.size}B, MD5 HASH: ${oldHash} => ${blog.hash})`)
    } else {
      await this.onAddFile(path)
    }
  }

  blog (name) {
    return this.fileCahce.get(name + '.md')
  }

  category (name) {
    if (fs.existsSync(path.join(this.baseDir, name))) {
      const regexp = new RegExp('^' + (name ? name + '/' : '') + '[^/]+\\.md')
      return {
        blogs: Array.from(this.fileCahce.keys()).
          filter(name => regexp.test(name) && !/(^|\/)index\.md$/.test(name)).
          map(name => this.fileCahce.get(name)),
        categories: load(name, this.baseDir).
          getFiles().
          filter(file => isDirectory(file)).
          map(file => file.name)
      }
    } else {
      return null
    }
  }

}

const controller = new BlogController(config.app['blog-home'])
const app = new Koa()
const appLogger = getLogger('BLOXCITING')
appLogger.level = 'trace'

module.exports.use = function (any) {
  app.use(any)
}

module.exports.start = function () {

  app.use((ctx, next) => {
    if (/^\/api\/v1\/blogs(\/|$)/.test(ctx.request.path)) {
      const blogName = decodeURIComponent(
        ctx.request.path.replace(/^\/api\/v1\/blogs(\/|$)/, ''))
      const blog = controller.blog(blogName)
      if (blog) {
        const noneMatch = ctx.get('if-none-match')
        if (noneMatch === blog.hash) {
          ctx.status = 304
          return
        }

        const since = new Date(ctx.get('if-modified-since'))
        if (since >= blog.lastModified) {
          ctx.status = 304
          return
        }

        ctx.status = 200
        ctx.etag = blog.hash
        ctx.lastModified = blog.lastModified.toUTCString()
        ctx.set('content-length', blog.compiledFile.size)
        ctx.set('content-type', 'text/html; charset=UTF-8')
        ctx.set('cache-control',
          'max-age=0, no-cache, must-revalidate, private')

        if (ctx.method !== 'head') {
          ctx.body = blog.compiledFile.readableStream
        }
      } else {
        const blogs = controller.category(blogName)
        if (blogs) {
          ctx.body = blogs
        } else {
          ctx.status = 404
        }
      }
    }
    else {
      next()
    }
  })

  const port = config.app.port || 18888
  app.listen(port, () => appLogger.trace('Bloxciting start to listen', port))
}

module.exports.serveAssets = function () {
  appLogger.warn('You should use cdn to serve asset files.')
  app.use((ctx, next) => {
    if (/^\/(css|js)\//.test(ctx.request.path)) {
      ctx.set('cache-control', 'max-age=600000000')
      if (/\.css$/.test(ctx.path)) {
        ctx.set('content-type', 'text/css; charset=UTF-8')
      } else if (/\.js$/.test(ctx.path)) {
        ctx.set('content-type', 'text/javascript; charset=UTF-8')
      }
      ctx.body = fs.createReadStream(
        path.join(__dirname, 'web/dist', ctx.request.path))
    } else {
      next()
    }
  })
}

module.exports.serveHomePage = function () {
  app.use(async (ctx, next) => {
    if (!/^\/api\//.test(ctx.path)) {
      ctx.set('content-type', 'text/html; charset=UTF-8')
      ctx.body = fs.createReadStream(
        path.join(__dirname, 'web/dist/index.html'))
    } else {
      await next()
    }
  })
}

module.exports.setLoggerLevel = function (level) {
  controller.logger.level = level
  appLogger.level = level
}
