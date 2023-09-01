import { createApp, nextTick } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw, RouterHistory } from 'vue-router'
import App from './App.vue'
//import './index.css'
import router from './router'

createApp(App).use(router).mount('#app');
