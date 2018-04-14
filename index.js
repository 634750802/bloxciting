#!node

const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const crypto = require('crypto')

function resolve (filename) {
  return path.resolve(process.cwd(), filename)
}

const config = require(resolve('bloxciting.config.json'))

class FileBasedObject {
  constructor (filename, cwd) {
    Object.defineProperty(this, 'path', {
      value: path.join(cwd, filename),
      enumerable: false
    })
    Object.defineProperty(this, 'cwd', {
      value: cwd,
      enumerable: false
    })
  }

  /**
   *
   * @returns {Stats}
   */
  get stat () {
    return fs.statSync(this.path)
  }

  toString () {
    return JSON.stringify(this)
  }
}

class Blog extends FileBasedObject {
  constructor (filename, cwd) {
    super(filename, cwd)
    this.title = filename.replace(/[^/]+\//g, '').replace(/\.md$/, '')
    this.refreshInfo()
  }

  refreshInfo () {
    const stat = this.stat
    this.lastModifiedDate = stat.mtime
    this.size = stat.size
    this.hashFile()
  }

  hashFile () {
    const hash = crypto.createHash('md5')
    const file = fs.createReadStream(this.path)
    this.hash = new Promise(resolve => {
      file.on('data', data => hash.update(data))
      file.on('end', () => {
        const res = hash.digest('hex')
        this.hash = res
        resolve(res)
      })
    })
  }

  get ready () {
    return Promise.all([this.hash])
  }
}

class BlogController {

  constructor (dir) {
    this.baseDir = dir
    this.watchDir(dir)
    this.fileCahce = new Map()
  }

  watch (any) {

  }

  watchDir (dir) {
    const watcher = chokidar.watch('**/*', {
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
        stabilityThreshold: 10000
        // pollInterval: 100
      },

      ignorePermissionErrors: false,
      atomic: true // or a custom 'atomicity delay', in milliseconds (default 100)
    })
    const log = console.log
    watcher.on('add', path => this.onAddFile(path)).
      on('change', path => this.onFileChanged(path)).
      on('unlink', path => this.onFileRemoved(path))

// More possible events.
    watcher.on('addDir', path => log(`Directory ${path} has been added`)).
      on('unlinkDir', path => log(`Directory ${path} has been removed`)).
      on('error', error => log(`Watcher error: ${error}`)).
      on('ready', () => log('Initial scan complete. Ready for changes'))
  }

  onAddFile (path) {
    const blog = new Blog(path, this.baseDir)
    this.fileCahce.set(path, blog)
    blog.ready.then(() => {
      console.log(
        `Blog created: ${blog.title} (${blog.size}B, MD5 HASH: ${blog.hash})`)
    })
  }

  onFileRemoved (path) {
    const blog = this.fileCahce.get(path)
    this.fileCahce.delete(path)
    if (blog) {
      console.log(
        `Blog removed: ${blog.title} (${blog.size}B, MD5 HASH: ${blog.hash})`)
    }
  }

  async onFileChanged (path) {
    const blog = this.fileCahce.get(path)
    if (blog) {
      const oldHash = blog.hash
      const oldSize = blog.size
      blog.refreshInfo()
      blog.ready.then(() => {
        console.log(
          `Blog updated: ${blog.title} (${oldSize}B => ${blog.size}B, MD5 HASH: ${oldHash} => ${blog.hash})`)
      })
    } else {
      this.onAddFile(path)
    }
  }

  blogList () {
    return Array.from(this.fileCahce.values()).map(blog => blog.toString())
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
        categories: fs.readdirSync(path.join(this.baseDir, name)).
          filter(name => !/\./.test(name))
      }
    } else {
      return null
    }
  }

}

const controller = new BlogController(config.app['blog-home'])
const app = new Koa()
app.listen(config.app.port || 18888)

app.use(ctx => {
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
      if (since >= blog.lastModifiedDate) {
        ctx.status = 304
        return
      }

      ctx.status = 200
      ctx.set('etag', blog.hash)
      ctx.set('content-length', blog.size)
      ctx.set('content-type', 'text/markdown; charset=UTF-8')
      ctx.set('last-modified', blog.lastModifiedDate.toUTCString())
      // ctx.set('expires', blog.lastModifiedDate.toUTCString())
      ctx.set('cache-control', 'max-age=0, no-cache, must-revalidate, private')

      if (ctx.method !== 'head') {
        ctx.body = fs.createReadStream(blog.path)
      }
    } else {
      const blogs = controller.category(blogName)
      if (blogs) {
        ctx.body = blogs
      } else {
        ctx.status = 404
      }
    }
  } else if (/^\/(css|js)\//.test(ctx.request.path)) {
    ctx.set('cache-control', 'max-age=600000000')
    if (/\.css$/.test(ctx.path)) {
      ctx.set('content-type', 'text/css; charset=UTF-8')
    } else if (/\.js$/.test(ctx.path)) {
      ctx.set('content-type', 'text/javascript; charset=UTF-8')
    }
    ctx.body = fs.createReadStream(
      path.join(__dirname, 'web/dist', ctx.request.path))
  } else {
    ctx.set('content-type', 'text/html; charset=UTF-8')
    ctx.body = fs.createReadStream(path.join(__dirname, 'web/dist/index.html'))
  }
})
