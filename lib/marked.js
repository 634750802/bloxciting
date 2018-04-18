const marked = require('marked')
const highlightjs = require('highlight.js')
const {getLogger} = require('log4js')

class MarkdownRenderer extends marked.Renderer {

  constructor (options) {
    super(options)
    this.$title = ''
    this.$description = ''
    this.$keys = undefined
    this.h = [0, 0, 0, 0, 0, 0]
    this.$author = options.author
  }

  code (code, language, isEscaped) {
    return `<pre><code class="hljs ${language}">${highlightjs.highlightAuto(
      code, [language]).value}</code></pre>`
  }

  table (header, body) {
    return `<div class="table-wrapper"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`
  }

  heading (text, level, raw) {
    this.h[level - 1]++
    let append = ''
    const currentLevel = this.h[level - 1]
    const realLevel = this.h.slice(0, level - 1).
      map(num => num + '.').
      join('') + currentLevel
    const displayLevel = level > 1 ? `<span class="header-level">${this.h.slice(
      1, level - 1).map(num => num + '.').join('')}${currentLevel}</span>` : ''
    if (level === 1) {
      if (!this.$title) {
        this.$title = text
        const date = new Date()
        return `
<header>
  <h${level} id="${realLevel}">${displayLevel}${text}</h${level}>
  <section class="meta-info">
    <span class="author">AUTHOR: <a href="mailto:${this.$author.email}">${this.$author.nickname}</a></span>
    <span class="last-modified">LAST MODIFIED：${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
  </section>
</header>`
      } else {
        logger.warn(
          'One .md file should has only one h1, which is intended to be the title of the page. Bloxciting will take first h1 as title.')
      }
    }
    return `<h${level} id="${realLevel}">${displayLevel}${text}</h${level}>${append}`
  }

  paragraph (text) {
    if (!this.$description) {
      this.$description = text
    }
    return super.paragraph(text)
  }
}

const logger = getLogger('MARKDOWN COMPILER')

module.exports = function (content, options) {
  return marked(content, Object.assign({
    renderer: new MarkdownRenderer(options),
    langPrefix: ''
  }, options))
}

module.exports.fragment = module.exports

module.exports.html = function (content, options) {
  const renderer = new MarkdownRenderer(options)

  const html = marked(content, Object.assign({
    renderer,
    langPrefix: ''
  }, options))
  const title = renderer.$title
  const description = renderer.$description.replace(/[^\\]"/g,
    str => str.substr(0, 1) + '"')
  return `<!DOCTYPE html><html><head><title>${title}</title><meta name="description" content="${description}"/></head><body>${html}</body></html>`
}

module.exports.logger = logger
