/*
能发送ajax请求的函数模块
  包装axios
  函数的返回值是promise对象
  axios.get()/post()返回的就是promise对象
  返回自己创建的promise对象:
      统一处理请求异常
      异步返回结果数据, 而不是包含结果数据的response
 */
import axios from 'axios'
import {message} from 'antd'

export default function ajax(url, data = {}, method = 'GET') {

  return new Promise(function (resolve, reject) {
    let promise
    // 执行异步ajax请求
    if (method === 'GET') {
      promise = axios.get(url, {params: data}) // params配置指定的是query参数
    } else {
      promise = axios.post(url, data)
    }
    promise.then(response => {
      // 如果成功了, 调用resolve(response.data)
      resolve(response.data)
    }).catch(error => {  // 对所有ajax请求出错做统一处理, 外层就不用再处理错误了
      // 如果失败了, 提示请求后台出错
      message.error('请求错误: ' + error.message)
    })
  })
}


