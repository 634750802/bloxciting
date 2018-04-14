# 个人博客的实现

    用WordPress写博客已经是上个decade的事了，现在我们需要一种更简介而更可控的方式实现一个个人博客。

## 功能

### 上传博客/更改博客

bloxciting使用Markdown渲染博客，优势在于可以使用Git来管理博客历史。bloxciting会在运行时监听`blog-home`目录下的全部文件，并可以使用简单的HTTP服务获取。

### 分类（Category）

bloxciting使用目录作为分类，每个目录下的`index.md`文件即目录的说明。

### 渲染

bloxciting使用Vue作为渲染引擎。所有数据均通过HTTP Api获取

### SEO优化

关于SEO优化还需讨论。目前构想的方案是使用User-Agent区分爬虫。

### 配置文件

```json
{
  "app": {
    "blog-home": "blog-home",
    "port": 18888
  },
  "author": {
    "nickname": "D·Jagger",
    "email": "634750802@qq.com",
    "signature": "Front-end developer, feeling excited in Vue.js and all great front end projects."
  }
}
```