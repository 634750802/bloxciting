<template>
  <div id="app">
    <Header ref="header"/>
    <div class="container" :style="{transform: `translateY(${headerHeight})`}">
      <breadcrumbs/>
      <keep-alive>
        <blog v-if="type === 'blog'" :data="data"/>
        <category v-else-if="type === 'category'" :data="data" :categoryDescription="categoryDescription"/>
        <not-found v-else/>
      </keep-alive>
    </div>
  </div>
</template>

<script>
  import Axios from 'axios'
  import Blog from './components/Blog.vue'
  import Header from './components/Header'
  import Category from './components/Category'
  import NotFound from './components/NotFound'
  import Breadcrumbs from './components/Breadcrumbs'

  const api = Axios.create({baseURL: process.env.VUE_APP_BASE_URL || '/'})

  api.interceptors.response.use(undefined, value => {
    return value
  })

  export default {
    name: 'app',
    data () {
      return {
        type: 'none',
        data: undefined,
        categoryDescription: undefined,
        headerHeight: '80px'
      }
    },
    components: {
      Breadcrumbs,
      NotFound,
      Category,
      Header,
      Blog
    },
    async mounted () {
      this.reload()
      this.$router.$on('change', () => this.reload())
      window.onresize = () => {
        this.headerHeight = getComputedStyle(this.$refs.header.$el).height
      }
      this.headerHeight = getComputedStyle(this.$refs.header.$el).height
    },
    methods: {
      async reload () {
        this.state = 'loading'
        this.data = undefined
        this.categoryDescription = undefined
        const path = location.pathname.replace(/\/$/, '')
        const info = await api.get('/api/v1/blogs' + path)
        document.title = 'Loading'
        if (info.data) {
          document.title = 'D·Jagger - ' + path ? decodeURI(path.substr(path.lastIndexOf('/') + 1)) : 'Home'
          if (typeof info.data === 'object') {
            this.type = 'category'
            this.categoryDescription = (await api.get('/api/v1/blogs' + path + '/index')).data
            this.data = info.data
          } else {
            this.type = 'blog'
            this.data = info.data
          }
        } else {
          this.type = 'not-found'
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .container {
    max-width: 768px;
    margin: 0 auto auto;
    padding: 20px;
    box-sizing: border-box;
    transition: transform .25s;
    z-index: 0;
  }
</style>
