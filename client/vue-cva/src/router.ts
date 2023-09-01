import { createRouter, createWebHistory } from 'vue-router'
import SrCheckoutForm from './views/SrCheckoutForm.vue'
import SrReturn from './views/SrReturn.vue'
export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: SrCheckoutForm,
    },
    {
      path: '/return',
      component: SrReturn
    }
  ]
})