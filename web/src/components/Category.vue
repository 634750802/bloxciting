<template>
  <div>
    <template v-if="categoryDescription">
      <Blog v-if="categoryDescription" class="" :data="categoryDescription"/>
    </template>
    <template v-if="data">
      <template v-if="data.categories.length">
        <p class="indicator">{{isRoot() ? '' : 'Sub '}}Categories</p>
        <ul>
          <li v-for="cate in data.categories"><router-link :href="getLocation(cate)">{{cate}}</router-link></li>
        </ul>
      </template>
      <template v-if="!categoryDescription">
        <p class="indicator">Blogs</p>
        <ul v-if="data.blogs.length">
          <li v-for="blog in data.blogs"><router-link :href="getLocation(blog.title)">{{blog.title}}</router-link></li>
        </ul>
        <p v-else>None in current category.</p>
      </template>
    </template>
  </div>
</template>

<script>
  import RouterLink from './RouterLink'
  import Blog from './Blog'

  export default {
    name: 'Category',
    components: {Blog, RouterLink},
    props: {
      categoryDescription: String,
      data: Object
    },
    methods: {
      getLocation (name) {
        return location.pathname.replace(/\/$/, '') + '/' + encodeURIComponent(name)
      },
      isRoot () {
        return location.pathname === '/' || location.pathname === ''
      }
    }
  }
</script>

<style lang="less" scoped>
  .indicator {
    color: gray;
    font-size: 36px;
    margin-top: 40px;
    margin-bottom: 20px;
    &::before {
      content: '</>';
      color: black;
      margin-right: 12px;
    }
  }
</style>