import React, {Component} from 'react'
import {
  Card,
  Button,
  Table,
  Form,
  Input,
  Select,
  Modal,
  Icon,
  message
} from 'antd'

import {
  reqUsers,
  reqAddOrUpdateUser,
  reqDeleteUser
} from '../../api'
import {formateDate} from '../../utils/utils'

const FormItem = Form.Item
const Option = Select.Option

/*
用户管理路由组件
 */
export default class User extends Component {

  state = {
    users: [], // 用户列表
    roles: [], // 角色列表
    isShow: false, // 是否显示添加/更新用户的Modal
  }

  /*
  异步获取用户列表显示
   */
  getUsers = async () => {
    const result = await reqUsers()
    if (result.status === 0) {
      const {users, roles} = result.data
      this.initRoleMap(roles)
      this.setState({
        users,
        roles
      })
    }
  }

  /*
  初始化产生一个保存角色名的容器对象, 属性名为角色的id
   */
  initRoleMap = (roles) => {
    const roleMap = roles.reduce((pre, role) => {
      pre[role._id] = role.name
      return pre
    }, {})
    this.roleMap = roleMap
  }

  /*
  初始化Table的字段列表
   */
  initColumns = () => {
    this.columns = [
      {
        title: '用户名',
        dataIndex: 'username'
      },
      {
        title: '邮箱',
        dataIndex: 'email'
      },
      {
        title: '电话',
        dataIndex: 'phone'
      },
      {
        title: '注册时间',
        dataIndex: 'create_time',
        render: formateDate
      },
      {
        title: '所属角色',
        dataIndex: 'role_id',
        render: (roleId) => {
          return this.roleMap ? this.roleMap[roleId] : ''
        }
      },
      {
        title: '操作',
        render: (user) => {
          return (
            <span>
              <a href="javascript:;" onClick={() => this.showUpdateUser(user)}>修改</a>
              &nbsp;&nbsp;
              <a href="javascript:;" onClick={() => this.clickDeleteUser(user)}>删除</a>
            </span>
          )
        }
      },
    ]
  }

  /*
  显示添加用户的Modal
   */
  showAddUser = () => {
    this.user = null
    this.setState({
      isShow: true
    })
  }

  /*
  显示更新用户的Modal
   */
  showUpdateUser = (user) => {
    this.user = user
    this.setState({
      isShow: true
    })
  }

  /*
  点击删除用户
   */
  clickDeleteUser = (user) => {
    Modal.confirm({
      content: `你确定要删除此${user.username}吗?`,
      onOk: async () => {
        const result = await reqDeleteUser(user._id)
        this.getUsers()
      }
    })
  }

  /*
  添加或更新用户
   */
  AddOrUpdateUser = async () => {
    const formUser = this.form.getFieldsValue()
    if (this.user) {
      formUser._id = this.user._id
    }
    this.form.resetFields()
    this.setState({
      isShow: false
    })
    const result = await reqAddOrUpdateUser(formUser)
    if (result.status === 0) {
      this.getUsers()
    } else {
      message.error(result.msg)
    }
  }


  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getUsers()
  }

  render() {
    console.log('render()')
    const {users, roles, isShow} = this.state
    const {user} = this
    const isAdd = user ? false : true

    return (

      <div>
        <Card>
          <Button type="primary" onClick={this.showAddUser}>创建用户</Button>
        </Card>

        <Table
          columns={this.columns}
          rowKey='_id'
          dataSource={users}
          bordered
          pagination={{defaultPageSize: 10, showQuickJumper: true}}
        />

        <Modal
          title={isAdd ? '添加用户' : '更新用户'}
          visible={isShow}
          onCancel={() => this.setState({isShow: false})}
          onOk={this.AddOrUpdateUser}
        >
          <UserForm setForm={(form) => this.form = form} user={user} roles={roles}/>
        </Modal>

      </div>
    )
  }
}

/*
用来添加或更新的form组件
 */
class UserForm extends Component {

  /*
  初始化<Option/>的列表
   */
  initOptions = () => {
    const roles = this.props.roles
    return roles.map(role => (<Option key={role._id} value={role._id}>{role.name}</Option>))
  }

  componentWillMount() {
    this.props.setForm(this.props.form)
  }

  render() {
    const user = this.props.user || {}
    const {getFieldDecorator} = this.props.form
    const formItemLayout = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    }

    const options = this.initOptions()

    return (
      <Form>
        <FormItem label="用户名" {...formItemLayout}>
          {
            getFieldDecorator('username', {
              initialValue: user.username
            })(
              <Input type="text" placeholder="请输入用户名"/>
            )
          }
        </FormItem>

        {
          !user._id
          ? (
              <FormItem label="密码" {...formItemLayout}>
                {
                  getFieldDecorator('password', {
                    initialValue: ''
                  })(
                    <Input type="passowrd" placeholder="请输入密码"/>
                  )
                }
              </FormItem>
            )
          : null
        }


        <FormItem label="手机号" {...formItemLayout}>
          {
            getFieldDecorator('phone', {
              initialValue: user.phone
            })(
              <Input type="phone" placeholder="请输入手机号"/>
            )
          }
        </FormItem>

        <FormItem label="邮箱" {...formItemLayout}>
          {
            getFieldDecorator('email', {
              initialValue: user.email
            })(
              <Input type="email" placeholder="请输入邮箱"/>
            )
          }
        </FormItem>

        <FormItem label="角色" {...formItemLayout}>
          {
            getFieldDecorator('role_id', {
              initialValue: user.role_id || '未选择'
            })(
              <Select style={{width: 200}}>
                {options}
              </Select>
            )
          }
        </FormItem>
      </Form>
    )
  }
}

UserForm = Form.create()(UserForm)
