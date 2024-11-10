import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import storage from './../utils/storage'
import API from './../api'
import utils from './../utils/utils'

const routes = [
    {
        name: 'home',
        path: '/',
        meta: {
            title: 'Homepage'
        },
        component: Home,
        redirect: '/welcome',
        children: [
            {
                name: 'welcome',
                path: '/welcome',
                meta: {
                    title: 'Dashboard'
                },
                component: () => import('@/views/Welcome.vue')
            }
        ]
    },
    {
        name: 'login',
        path: '/login',
        meta: {
            title: 'Login'
        },
        component: () => import('@/views/Login.vue')
    },
    {
        name: 'User Info',
        path: '/userInfo',
        meta: {
            title: 'UserInfo'
        },
        component: Home,
        redirect: '/userInfo',
        children: [
            {
                name: 'userInfo',
                path: '/userInfo',
                meta: {
                    title: 'User Info'
                },
                component: () => import('@/views/Userinfo.vue')
            }
        ]
    },
    {
        name: 'Menu',
        path: '/menu',
        meta: {
            title: 'Menu'
        },
        component: Home,
        redirect: '/menu',
        children: [
            {
                name: 'menu',
                path: '/menu',
                meta: {
                    title: 'Menu'
                },
                component: () => import('@/views/Menu.vue')
            }
        ]
    },
    {
        name: 'User',
        path: '/user',
        meta: {
            title: 'User'
        },
        component: Home,
        redirect: '/user',
        children: [
            {
                name: 'User',
                path: '/user',
                meta: {
                    title: 'user'
                },
                component: () => import('@/views/User.vue')
            }
        ]
    },
    {
        name: 'role',
        path: '/role',
        meta: {
            title: 'Role'
        },
        component: Home,
        redirect: '/role',
        children: [
            {
                name: 'role',
                path: '/role',
                meta: {
                    title: 'ba'
                },
                component: () => import('@/views/Role.vue')
            }
        ]
    },
    {
        name: 'Department',
        path: '/department',
        meta: {
            title: 'Department'
        },
        component: Home,
        redirect: '/department',
        children: [
            {
                name: 'department',
                path: '/dep',
                meta: {
                    title: 'dep'
                },
                component: () => import('@/views/Dept.vue')
            }
        ]
    },
    {
        name: 'Leave',
        path: '/leave',
        meta: {
            title: 'Leave'
        },
        component: Home,
        redirect: '/leave',
        children: [
            {
                name: 'Leave',
                path: '/leave',
                meta: {
                    title: 'leave'
                },
                component: () => import('@/views/Leave.vue')
            }
        ]
    },
    {
        name: 'Approval',
        path: '/appr',
        meta: {
            title: 'Approval'
        },
        component: Home,
        redirect: '/appr',
        children: [
            {
                name: 'Approval',
                path: '/appr',
                meta: {
                    title: 'Approval'
                },
                component: () => import('@/views/Approve.vue')
            }
        ]
    },
    {
        name: '404',
        path: '/404',
        meta: {
            title: 'non-exist page'
        },
        component: () => import('@/views/404.vue')
    }
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})

async function loadAsyncRoutes() {
    let userInfo = storage.getItem('userInfo') || {}
    if (userInfo.token) {
        try {
            const { menuList } = await API.getPermissionList()
            let routes = utils.generateRoute(menuList)
            routes.map(route => {
                let url = `./../views/${route.component}.vue`
                route.component = () => import(url)
                // router.addRoute("home", route)
            })
        } 
        catch (error) {
            console.log("error")
        }
    }
}

function checkPermission(path) {
    let hasPermission = router.getRoutes().filter(route => route.path == path).length;
    if (hasPermission) {
        return true;
    } else {
        return false;
    }
}

router.beforeEach((to, from, next) => {
    if (router.hasRoute(to.name)) {
        document.title = to.meta.title;
        next()
    } else {
        next('/404')
    }
})

export default router