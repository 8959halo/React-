import React from 'react'
import {Row, Col, Modal} from "antd"
import {withRouter} from 'react-router-dom'

import MemoryUtils from '../../utils/MemoryUtils'
import storageUtils from '../../utils/storageUtils'
import {formateDate} from '../../utils/utils'
import {reqWeather} from '../../api'
import menuList from '../../config/menuConfig'


import './header.less'

/*
头部组件
 */
class Header extends React.Component {

  state = {
    sysTime: formateDate(new Date().getTime()), // 当前时间
    dayPictureUrl: '', // 天气图片url
    weather: '' // 天气文本
  }

  /*
  获取指定地址的天气信息
   */
  getWeather = async () => {
    let city = '北京'
    const {dayPictureUrl, weather} = await reqWeather(city)
    this.setState({
      dayPictureUrl,
      weather
    })
  }

  /*
  登出
   */
  logout = () => {
    Modal.confirm({
      content: '确定退出登陆吗?',
      onOk: () => {
        MemoryUtils.user = {}
        storageUtils.removeUser()
        this.props.history.replace('/login')
      }
    })
  }

  /*
  每隔1s更新当前时间显示
   */
  updateTime = () => {
    this.intervalId = setInterval(() => {
      const sysTime = formateDate(new Date().getTime())
      this.setState({
        sysTime
      })
    }, 1000)
  }

  /*
 根据请求的路由路径得到菜单名称
  */
  getMenuName(path) {
    let menuName
    for (let i = 0; i < menuList.length; i++) {
      let menu = menuList[i]
      if (menu.key == path) {
        menuName = menu.title
        break
      } else if (menu.children) {
        for (let j = 0; j < menu.children.length; j++) {
          const menu2 = menu.children[j]
          if (path.indexOf(menu2.key) === 0) {
            menuName = menu2.title
            break
          }
        }
        if (menuName) {
          break
        }
      }
    }
    return menuName || '首页'
  }

  componentDidMount() {
    // 异步获取天气
    this.getWeather()
    // 更新时间
    this.updateTime()
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  render() {
    const {sysTime, dayPictureUrl, weather} = this.state
    const username = MemoryUtils.user.username
    const path = this.props.location.pathname
    const menuName = this.getMenuName(path)

    return (
      <div className="header">
        <Row className="header-top">
          <Col span={24}>
            <span>欢迎，{username}</span>
            <a href="javascript:" onClick={this.logout}>退出</a>
          </Col>
        </Row>
        <Row className="breadcrumb">
          <Col span={4} className="breadcrumb-title">
            {menuName}
          </Col>
          <Col span={20} className="weather">
            <span className="date">{sysTime}</span>
            <span className="weather-img">
              <img src={dayPictureUrl} alt="weather"/>
            </span>
            <span className="weather-detail">
              {weather}
            </span>
          </Col>
        </Row>
      </div>
    )
  }
}

export default withRouter(Header)