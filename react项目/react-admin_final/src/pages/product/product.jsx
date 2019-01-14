import React, {Component} from 'react'
import {
  Route,
  Switch,
  Redirect
} from 'react-router-dom'

import ProductIndex from './index'
import ProductAddUpdate from './add-update'
import ProductDetail from './detail'

import './index.less'

/*
商品管理的一级路由组件
 */
export default class Product extends Component {
  render() {
    return (
      <Switch>
        <Route path="/product/index" component={ProductIndex}/>
        <Route path="/product/saveupdate" component={ProductAddUpdate}/>
        <Route path="/product/detail" component={ProductDetail}/>
        <Redirect exact from="/product" to="/product/index"/>
      </Switch>
    )
  }
}