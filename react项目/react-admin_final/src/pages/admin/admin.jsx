import React, {Component} from 'react'
import {Row, Col} from 'antd'
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom'

import MemoryUtils from '../../utils/MemoryUtils'
import LeftNav from '../../components/left-nav/left-nav'
import Header from '../../components/header/header'
import Footer from '../../components/footer/footer'
import Home from '../home/home'
import Category from '../category/category'
import Product from '../product/product'
import User from '../user/user'
import Role from '../role/role'
import Bar from '../charts/bar'
import Line from '../charts/line'
import Pie from '../charts/pie'

import './admin.less'

/*
后台管理主路由组件
 */
export default class Admin extends Component {

  render() {
    // 检查是否已经登陆, 如果没有登陆, 自动跳转到登陆页面
    if (!MemoryUtils.user._id) {
      return <Redirect to='/login'></Redirect>
    }

    return (
      <Row className="container">
        <Col span={4}>
          <LeftNav/>
        </Col>
        <Col span={20} className="main">
          <Header/>
          <div className="content">
            <Switch>
              <Route path='/home' component={Home}/>
              <Route path='/category' component={Category}/>
              <Route path='/product' component={Product}/>
              <Route path='/user' component={User}/>
              <Route path='/role' component={Role}/>
              <Route path="/charts/bar" component={Bar}/>
              <Route path="/charts/pie" component={Pie}/>
              <Route path="/charts/line" component={Line}/>
              <Redirect to='/home'/>
            </Switch>
          </div>
          <Footer/>
        </Col>
      </Row>
    )
  }
}