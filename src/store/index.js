// import Cookie from 'js-cookie'
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
//不是在生产环境debug为true
const debug = process.env.NODE_ENV !== 'production';
//创建Vuex实例对象
const store = new Vuex.Store({
    state: {
        menu: []
    },
    getters: {

    },
    mutations: {
        setMenu(state, val) {
            state.menu = val;
            // Cookie.set('menu', JSON.stringify(val))
        },
        // addMenu(state, router) {
        //     if (!Cookie.get('menu')) {
        //         return
        //     }

        //     const menu = JSON.parse(Cookie.get("menu"));
        //     state.menu = menu;

        //     const menuArray = [];
        //     menu.forEach(item => {
        //         if (item.children) {
        //             item.children = item.children.map(item => {
        //                 item.component = () =>
        //                     import(`../views/${item.url}`);
        //                 return item
        //             })
        //             menuArray.push(...item.children)
        //         } else {
        //             item.component = () =>
        //                 import(`../views/${item.url}`);
        //             menuArray.push(item)
        //         }
        //     })
        //     // 路由的动态添加
        //     menuArray.forEach(item => {
        //         router.addRoute(item)
        //     })
        // }
    },
    actions: {
    }
})
export default store;