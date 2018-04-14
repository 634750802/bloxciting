<template>
  <div v-if="blogContent" v-html="blogContent"></div>
  <div v-else></div>
</template>

<script>
  import marked from 'marked'

  export default {
    name: 'Blog',
    props: {
      data: {
        type: String,
        required: true
      }
    },
    computed: {
      blogContent () {
        return marked(this.data)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>

</style>
