const fs = require('fs')
const {join, basename, dirname} = require('path')
const {createHash} = require('crypto')
const mkdirp = require('mkdirp')

class AnyFile {

  constructor (path, {cwd}) {
    this._path = join(cwd, path)
    this._options = {cwd}
    this._name = basename(path)
    this._dirname = dirname(this._path)
    if (fs.existsSync(this._path)) {
      this._stat = fs.statSync(this._path)
    }
  }

  get path () {
    return this._path
  }

  get size () {
    return this._stat.size
  }

  get lastModified () {
    return this._stat.mtime
  }

  get name () {
    return this._name
  }

  get dirname () {
    return this._dirname
  }

  get exists () {
    return fs.existsSync(this.path)
  }

  refresh () {
    if (this.exists) {
      this._stat = fs.statSync(this.path)
    } else {
      this._stat = null
    }
  }

  remove () {
    this._stat = null
    fs.unlinkSync(this.path)
  }

  equalsTo (file) {
    return AnyFile.isEqual(this, file)
  }

  /**
   *
   * @param {AnyFile}file
   * @returns {boolean}
   */
  static isDirectory (file) {
    return file._stat.isDirectory()
  }

  /**
   *
   * @param {AnyFile}file
   * @returns {boolean}
   */
  static isFile (file) {
    return file._stat.isFile()
  }

  /**
   *
   * @param {AnyFile}file1
   * @param {AnyFile}file2
   * @returns {boolean}
   */
  static isEqual (file1, file2) {
    return file1._path === file2._path
  }

  /**
   *
   * @param name
   * @param cwd
   * @return {AnyFile|File|Directory}
   */
  static load (name, cwd) {
    const path = join(cwd, name)
    const stat = fs.statSync(path)
    if (stat.isFile()) {
      return new File(name, {cwd})
    } else if (stat.isDirectory()) {
      return new Directory(name, {cwd})
    } else {
      return new AnyFile(name, {cwd})
    }
  }

  static create (name, cwd) {
    return new File(name, {cwd})
  }

}

class Directory extends AnyFile {

  /**
   *
   * @param {RegExp | function(name: string):boolean?}filter
   * @return {Array.<AnyFile>}
   */
  getFiles (filter) {
    let filenames = fs.readdirSync(this.path)
    if (filter) {
      if (filter instanceof RegExp) {
        filenames = filenames.filter(filename => filter.test(filename))
      } else if (typeof filter === 'function') {
        filenames = filenames.filter(filter)
      } else {
        console.warn('Filter\'s type must be regexp or function.')
      }
    }
    return filenames.map(name => AnyFile.load(name, this.path))
  }

}

class File extends AnyFile {

  /**
   *
   * @return {ReadStream}
   */
  get readableStream () {
    return fs.createReadStream(this.path)
  }

  /**
   *
   * @return {WriteStream}
   */
  get writableStream () {
    return fs.createWriteStream(this.path)
  }

  /**
   *
   * @returns {string}
   */
  get content () {
    return fs.readFileSync(this.path, {encoding: 'utf-8'})
  }

  /**
   *
   * @returns {Promise<string>}
   */
  md5Hash () {
    return new Promise(resolve => {
      const hash = createHash('md5')
      const file = fs.createReadStream(this.path)
      file.on('data', data => hash.update(data))
      file.on('end', () => {
        const res = hash.digest('hex')
        resolve(res)
      })
    })
  }

  /**
   *
   * @param {string}target
   * @param {function}compiler
   * @param {object}options
   * @param {string?}encoding
   * @return {Promise<void>}
   */
  compile (target, compiler, options, encoding = 'utf-8') {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, {encoding}, (err, content) => {
        if (err) {
          reject(err)
          return
        }
        const compileResult = compiler(content, options)
        mkdirp.sync(dirname(target))
        fs.writeFile(target, compileResult, {encoding},
          err => err ? reject(err) : resolve())
      })
    })
  }
}

module.exports = AnyFile
module.exports.File = File
module.exports.Directory = Directory
