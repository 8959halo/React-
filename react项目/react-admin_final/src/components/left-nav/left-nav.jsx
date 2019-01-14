import React from 'react'
import {Menu, Icon} from 'antd'
import {NavLink, withRouter} from 'react-router-dom'

import menuList from '../../config/menuConfig'
import MemoryUtils from '../../utils/MemoryUtils'
import logo from '../../assets/images/logo.png'

import './left-nav.less'

const SubMenu = Menu.SubMenu

/*
左侧导航组件
 */
class LeftNav extends React.Component {

  /*
  判断当前用户是否有指定菜单的权限
   */
  hasAuth = (menu) => {
    const userMenuKeys = this.userMenuKeys
    const isAdmin = MemoryUtils.user.username === 'admin'
    return isAdmin || menu.isPublic || userMenuKeys.has(menu.key)
  }

  /*
  得到当前用户需要显示的所有menu元素的列表
  使用递归调用
   */
  getMenuNodes = (menus) => {
    return menus.reduce((pre, item) => {
      if (this.hasAuth(item)) {
        if (item.children) {
          const subMenu = (
            <SubMenu key={item.key}
                     title={<span><Icon type={item.icon}/><span>{item.title}</span></span>}>
              {
                this.getMenuNodes(item.children)
              }
            </SubMenu>
          )
          pre.push(subMenu)
        } else {
          const menuItem = (
            <Menu.Item title={item.title} key={item.key}>
              <NavLink to={item.key}>
                <Icon type={item.icon}/>{item.title}
              </NavLink>
            </Menu.Item>
          )
          pre.push(menuItem)
        }
      }
      return pre
    }, [])
  }

  componentWillMount() {
    this.userMenuKeys = new Set(MemoryUtils.user.role.menus || [])
    this.menuNodes = this.getMenuNodes(menuList)
  }

  render() {

    // 得到请求路径
    const path = this.props.location.pathname

    return (
      <div className='left-nav'>
        <NavLink to="/home">
          <div className="logo">
            <img src={logo} alt="logo"/>
            <h1>硅谷后台</h1>
          </div>
        </NavLink>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[path]}
        >
          {this.menuNodes}
        </Menu>
      </div>
    )
  }
}

export default withRouter(LeftNav)