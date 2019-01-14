import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Form, Input, Button, Icon} from 'antd'

import {reqLogin} from '../../api'
import MemoryUtils from '../../utils/MemoryUtils'
import storageUtils from '../../utils/storageUtils'
import logo from '../../assets/images/logo.png'
import './index.less'

/*
用户登陆的路由组件
 */
export default class Login extends Component {

  state = {
    errorMsg: ''
  }

  // 请求后台登陆
  login = async (username, password) => {
    const result = await reqLogin(username, password)
    if (result.status === 0) {
      const user = result.data
      // 将user保存在内存中
      MemoryUtils.user = user
      storageUtils.saveUser(user)
      this.props.history.replace('/home')
    } else {
      const errorMsg = result.msg
      this.setState({ errorMsg })
    }
  }

  render() {
    return (
      <div className='login'>
        <div className="login-header">
          <img src={logo} alt="硅谷后台管理系统"/>
          React项目: 后台管理系统
        </div>
        <div className="login-content">
          <div className="login-box">
            <div className="error-msg-wrap">
              <div className={this.state.errorMsg ? "show" : ""}>
                {this.state.errorMsg}
              </div>
            </div>
            <div className="title">用户登陆</div>
            <LoginForm ref="login" login={this.login}/>
          </div>
        </div>
      </div>
    )
  }
}

/*
登陆的Form组件
 */
class LoginForm extends React.Component {

  static propTypes = {
    login: PropTypes.func.isRequired
  }

  /*
  响应点击登陆的回调函数
   */
  clickLogin = (e) => {

    // 阻止事件默认行为(不提交表单)
    e.preventDefault()

    // 对表单数据进行验证, 如果没有错误, 调用父组件的login方法
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.login(values.username, values.password)
      }
    })
  }

  /*
  检查username的validator函数
   */
  checkUsername = (rule, value, callback) => {
    if (!value) {
      callback('请输入用户名!')
    } else if (!/^\w+$/.test(value)) {
      callback('用户名只允许输入英文字母')
    } else if (value.length < 3) {
      callback('用户名至少4位')
    } else {
      callback()
    }
  }

  render() {
    const {getFieldDecorator} = this.props.form
    return (
      <Form className="login-form">
        <Form.Item>
          {getFieldDecorator('username', {
            rules: [{validator: this.checkUsername}]
          })(
            <Input placeholder="用户名" prefix={<Icon type="user"/>}/>
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [
              {
                type: 'string',
                required: true,
                whitespace: true,
                message: '请输入密码!!!'
              },
              {
                min: 4,
                max: 8,
                message: '密码必须是4到8位'
              }
            ]
          })(
            <Input type="password" placeholder="密码" prefix={<Icon type="safety"/>}/>
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={this.clickLogin} className="login-form-button">
            登录
          </Button>
        </Form.Item>
      </Form>
    )
  }
}

LoginForm = Form.create({})(LoginForm)