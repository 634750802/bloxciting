import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const router = Vue.prototype.$router = new Vue({})

window.onpopstate = function () {
  router.$emit('change')
}

Vue.prototype.$changeLocation = function (href) {
  if (history instanceof History) {
    history.pushState({}, '', href)
    router.$emit('change')
  } else {
    location = href
  }
}

new Vue({
  render: h => h(App)
}).$mount('#app')
