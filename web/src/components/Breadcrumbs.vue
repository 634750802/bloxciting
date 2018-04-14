<template>
  <div>
    <router-link :href="pathTokens.length > 0 ? '/' : undefined">Home</router-link>
    <template v-for="token in pathTokens">
      /
      <router-link :href="token.path">{{token.title}}</router-link>
    </template>
  </div>
</template>

<script>
  import RouterLink from './RouterLink'
  export default {
    name: 'Breadcrumbs',
    components: {RouterLink},
    data () {
      return {
        pathTokens: []
      }
    },
    async mounted () {
      this.reload()
      this.$router.$on('change', () => this.reload())
    },
    methods: {
      reload () {
        if (location.pathname === '/' || location.pathname === '') {
          this.pathTokens = []
          return
        }
        const arr = []
        for (const token of location.pathname.replace(/(^\/)|(\/$)/g, '').split('/')) {
          const path = (arr[arr.length - 1] || {path: ''}).path + '/' + token
          const title = decodeURIComponent(token)
          arr.push({path, title})
        }
        if (arr.length > 0) {
          arr[arr.length - 1].path = undefined
        }
        this.pathTokens = arr
      }
    }
  }
</script>

<style scoped>

</style>