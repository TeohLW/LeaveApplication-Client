/**
 * axios 
 */

import axios from "axios"
import config from './../config'
import { ElMessage } from "element-plus"
import router from './../router'
import storage from './storage'

const TOKEN_INVALID = 'Token fail, please sign in again'
const NETWORK_ERROR = 'network abnormal,try again later'

const service = axios.create({
    baseURL: config.baseApi,
    timeout: 8000
})


service.interceptors.request.use((req) => {
    const headers = req.headers
    const { token } = storage.getItem('userInfo') || {}
    if (!headers.Authorization) headers.Authorization = 'Bearer ' + token
    return req
})

service.interceptors.response.use((res) => {
    const { code, data, msg } = res.data;
    if (code === 200 || code === 0) {
        return data;
    } else if (code === 40001) {
        ElMessage.error(TOKEN_INVALID)
        // return Promise.reject(res.data)
        setTimeout(() => {
            router.push('/login')
        }, 1500)
        // return Promise.reject(TOKEN_INVALID,res,data)
        return Promise.reject(res.data)
    } else {
        ElMessage.error(msg || NETWORK_ERROR)
        // return Promise.reject(msg || NETWORK_ERROR,res.data)
        return Promise.reject(res.data)
    }
})

function request(options) {
    options.method = options.method || 'get'
    if (options.method.toLowerCase() === 'get') {
        options.params = options.data
    }
    let isMock = config.mock
    if (typeof options.mock != 'undefined') {
        isMock = options.mock
    }
    if (config.env === 'prod') {
        service.defaults.baseURL = config.baseApi
    } else {
        service.defaults.baseURL = isMock ? config.mockApi : config.baseApi
    }
    return service(options)
}

['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
    request[item] = (url, data, options) => {
        return request({
            url,
            data,
            method: item,
            ...options
        })
    }
})

export default request