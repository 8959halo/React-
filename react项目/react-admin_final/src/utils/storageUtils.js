/*
local存储工具模块
 */
const USER_KEY = 'user_key' // 保存user的标识key

/*
本地存储
 */
function setStorage(name, data) {
  let dataType = typeof data
  if (dataType === 'object') { // JS对象/数组
    window.localStorage.setItem(name, JSON.stringify(data))
  } else if (['number', 'string', 'boolean'].indexOf(dataType) >= 0) { // 基础类型
    window.localStorage.setItem(name, data)
  } else { // 其他不支持的类型
    alert('该类型不能用于本地存储')
  }
}

/*
取出本地存储内容
 */
function getStorage(name) {
  let data = window.localStorage.getItem(name)
  if (data) {
    return JSON.parse(data)
  } else {
    return ''
  }
}

/*
删除本地存储
 */
function removeStorage(name) {
  window.localStorage.removeItem(name)
}

export default {
  /*
  保存user
   */
  saveUser(user) {
    setStorage(USER_KEY, user)
  },

  /*
  获取User
   */
  getUser() {
    return getStorage(USER_KEY)
  },

  /*
  移除user
   */
  removeUser() {
    removeStorage(USER_KEY)
  }
}