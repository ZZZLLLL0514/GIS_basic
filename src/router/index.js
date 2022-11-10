import Vue from "vue"
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const routes=[
    {
        path:"/layers",
        component:()=> import ("../components/layers.vue"),
        name:"layers",
        children:[
            // {
            //     path:"/login",
            //     component:()=>import("../components/login.vue"),
            //     name:"login"
            // }
        ]
    },
    {
        path:"/login",
        component:()=>import("../components/login.vue"),
        name:"login"
    }
]
export default new VueRouter({
    mode: "history",
    routes,
})