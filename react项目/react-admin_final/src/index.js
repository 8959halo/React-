import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import MemoryUtils from './utils/MemoryUtils'
import storageUtils from './utils/storageUtils'

// 从local中读取user, 如果存在, 保存到内存工具中
const user = storageUtils.getUser()
if (user && user._id) {
  MemoryUtils.user = user
}

ReactDOM.render(<App />, document.getElementById('root'))