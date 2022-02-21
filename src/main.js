import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueConfetti from 'vue-confetti'



Vue.config.productionTip = false
Vue.use(VueConfetti)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
