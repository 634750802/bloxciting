<template>
  <div>
    <template v-if="categoryDescription">
      <p class="indicator">Category Introduction</p>
      <div v-if="categoryDescriptionMarked" style="padding-left: 30px;" v-html="categoryDescriptionMarked"></div>
    </template>
    <template v-if="data">
      <p class="indicator">Blogs</p>
      <ul v-if="data.blogs.length">
        <li v-for="blog in data.blogs"><router-link :href="getLocation(blog.title)">{{blog.title}}</router-link></li>
      </ul>
      <p v-else>None</p>
      <template v-if="data.categories.length">
        <p class="indicator">Sub Categories</p>
        <ul>
          <li v-for="cate in data.categories"><router-link :href="getLocation(cate)">{{cate}}</router-link></li>
        </ul>
      </template>
    </template>
  </div>
</template>

<script>
  import RouterLink from './RouterLink'
  import marked from 'marked'

  export default {
    name: 'Category',
    components: {RouterLink},
    props: {
      categoryDescription: String,
      data: {
        type: Object,
        required: String
      }
    },
    computed: {
      categoryDescriptionMarked () {
        return this.categoryDescription && marked(this.categoryDescription)
      }
    },
    methods: {
      getLocation (name) {
        return location.pathname.replace(/\/$/, '') + '/' + encodeURIComponent(name)
      }
    }
  }
</script>

<style lang="less" scoped>
  .indicator {
    color: gray;
    font-size: 24px;
    margin-top: 40px;
    margin-bottom: 20px;
    &::before {
      content: '#';
      color: black;
    }
  }
</style>