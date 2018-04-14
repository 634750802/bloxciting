<script>
  export default {
    name: 'router-link',
    props: {
      href: String
    },
    render (h) {
      const attrs = this.href ? {href: this.href, onclick: 'return false'} : undefined
      const on = this.href ? {
        click: () => {
          this.$changeLocation(this.href)
        }
      } : undefined
      return h('a', {
        attrs,
        on
      }, this.$slots.default)
    }
  }
</script>