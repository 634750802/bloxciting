<template>
  <article class="md" v-if="blogContent" v-html="blogContent"></article>
  <div v-else></div>
</template>

<script>

  export default {
    name: 'Blog',
    props: {
      data: String
    },
    computed: {
      blogContent () {
        return this.data
      }
    },
    mounted () {
      const hash = location.hash
      location.hash = '#'
      location.hash = hash
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

</style>
