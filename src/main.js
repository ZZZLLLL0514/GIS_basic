import Vue from 'vue'
import App from './App.vue'
import "lib-flexible/flexible.js"
Vue.config.productionTip = false
import router from './router'
import store from './store'
import './Mock/user'
import axios from"axios"
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
router.beforeEach((to, from, next) => {
//   console.log("router.options.routes",router.options.routes)
//   console.log("router.currentRoute",router.currentRoute)
  console.log("to",to)
  console.log("from",from)
//     store.commit('getToken');
//     const token = store.state.user.token;
//     if (!token && to.name !== 'login') {
//         next({ name: 'login' })
//     } else {
//         next()
//     }
if((from.name==null&&to.name!=="login"&& sessionStorage.getItem('isSignIn')!="true")||to.name==null){
    next({ name: 'login' });
}else {
    next()
}
})
Vue.prototype.$axios=axios
new Vue({
    router,
    store,
    render: h => h(App),
    created() {
        // store.commit('addMenu', router);
        // if (this.$route.path === '/')
            // router.push({ name: 'login' });
    }
}).$mount('#app')
