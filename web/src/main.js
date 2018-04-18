import Vue from 'vue'
import App from './App.vue'
import 'highlight.js/styles/idea.css'
import './styles.less'

Vue.config.productionTip = false

const router = Vue.prototype.$router = new Vue({
  data: {
    href: location.href
  },
  methods: {
    isSamePathWith (href) {
      return this.href.split('#')[0] === href.split('#')[0]
    }
  }
})

window.onpopstate = function () {
  if (!router.isSamePathWith(location.href)) {
    router.$emit('change')
    router.href = location.href
  }
}

Vue.prototype.$changeLocation = function (href) {
  if (history instanceof History) {
    history.pushState({}, '', href)
    if (!router.isSamePathWith(location.href)) {
      router.$emit('change')
      router.href = location.href
    }
  } else {
    location = href
  }
}

new Vue({
  render: h => h(App)
}).$mount('#app')
