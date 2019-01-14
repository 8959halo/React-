import React, {PureComponent} from 'react'
import {
  Card,
  Button,
  Table,
  Form,
  Input,
  Select,
  Tree,
  Modal,
} from 'antd'

import {
  reqRoles,
  reqAddRole,
  reqUpdateRoles
} from '../../api'
import menuConfig from '../../config/menuConfig'
import MemoryUtils from '../../utils/MemoryUtils'
import {formateDate} from '../../utils/utils'

const FormItem = Form.Item
const Option = Select.Option
const TreeNode = Tree.TreeNode


/*
权限(角色)管理路由组件
 */
export default class Role extends PureComponent {

  state = {
    roles: [], // 所有角色的列表
    role: {}, // 当前选中的角色
    menus: [], // 所有权限标识的数组
    isShowAdd: false, // 是否显示角色添加的框
    isShowRoleAuth: false, // 是否显示设置角色权限的框
    isShowUserRole: false, // 是否显示设置用户角色的框
  }

  /*
  异步获取角色列表
   */
  getRoles = async () => {
    const result = await reqRoles()
    if (result.status === 0) {
      const roles = result.data
      this.setState({
        roles
      })
    }
  }

  /*
  初始化Table的字段数据
   */
  initColumns = () => {
    this.columns = [
      {
        title: '角色名称',
        dataIndex: 'name'
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        render: formateDate
      },
      {
        title: '授权时间',
        dataIndex: 'auth_time',
        render: formateDate
      },
      {
        title: '授权人',
        dataIndex: 'auth_name',
      }
    ]
  }

  /*
  处理某个角色的Radio选中时, 更新role和menus
   */
  handleSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('handleSelectChange()', selectedRowKeys, selectedRows)
    const role = selectedRows[0]
    this.setState({
      role,
      menus: role.menus
    })
  }

  /*
  点击'创建角色'回调
   */
  showAddRole = () => {
    this.setState({
      isShowAdd: true
    })
  }

  /*
  点击'设置权限'回调
   */
  showRoleAuth = () => {
    this.setState({
      isShowRoleAuth: true
    })
  }

  /*
  给table的每行绑定点击监听
   */
  onRow = (role) => ({
    onClick: () => {
      console.log('onClick()')
      // 如果点击的是当前选中的, 直接结束
      /*if (this.state.role === role) {
        return
      }*/
      this.setState({
        role,
        menus: role.menus
      })
    }
  })

  /*
  异步添加角色
   */
  addRole = async () => {
    const roleName = this.addForm.getFieldValue('roleName')
    this.addForm.resetFields()
    const result = await reqAddRole(roleName)
    const role = result.data
    const roles = this.state.roles.slice()
    roles.push(role)
    this.setState({
      roles,
      isShowAdd: false
    })
  }

  /*
  更新角色
   */
  updateRole = async () => {
    const {role, menus} = this.state
    role.menus = menus
    role.auth_name = MemoryUtils.user.name || 'admin'
    this.setState({
      role,
      isShowRoleAuth: false
    })
    const result = await reqUpdateRoles(role)
    if (result.status === 0) {
      this.getRoles()
    }
  }

  /*
    更新menus状态
   */
  setRoleMenus = (menus) => {
    this.setState({
      menus
    })
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getRoles()
  }

  render() {
    console.log('render()')
    const {roles, isShowAdd, role, isShowRoleAuth, isShowUserRole, menus} = this.state

    const rowSelection = {
      type: 'radio',
      selectedRowKeys: [role._id],
      onChange: this.handleSelectChange
    }

    return (
      <div>
        <Card>
          <Button type="primary" onClick={this.showAddRole}>创建角色</Button>&nbsp;&nbsp;
          <Button type="primary" onClick={this.showRoleAuth} disabled={!role._id}>设置角色权限</Button>&nbsp;&nbsp;
        </Card>

        <Table
          columns={this.columns}
          rowKey='_id'
          dataSource={roles}
          bordered
          rowSelection={rowSelection}
          onRow={this.onRow}
          pagination={{defaultPageSize: 10, showQuickJumper: true}}
        />

        <Modal
          title="创建角色"
          visible={isShowAdd}
          onCancel={() => {
            this.setState({isShowAdd: false})
            this.addForm.resetFields()
          }}
          onOk={this.addRole}
        >
          <AddRoleForm setAddForm={(form) => this.addForm = form}/>
        </Modal>


        <Modal
          title="设置角色权限"
          visible={isShowRoleAuth}
          onCancel={() => this.setState({isShowRoleAuth: false, menus: role.menus})}
          onOk={this.updateRole}
        >
          <RoleAuthForm setAddForm={form => this.roleAuthForm = form}
                        role={role}
                        menus={menus}
                        setRoleMenus={this.setRoleMenus}/>
        </Modal>
      </div>
    )
  }
}

/*
用来添加角色的form组件
 */
class AddRoleForm extends PureComponent {

  componentWillMount() {
    this.props.setAddForm(this.props.form)
  }

  render() {
    console.log('AddRoleForm render()')
    const {getFieldDecorator} = this.props.form
    const formItemLayout = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };

    return (
      <Form>
        <FormItem label="角色名称" {...formItemLayout}>
          {
            getFieldDecorator('roleName', {
              initialValue: ''
            })(
              <Input type="text" placeholder="请输入角色名称"/>
            )
          }
        </FormItem>
      </Form>
    )
  }
}

AddRoleForm = Form.create()(AddRoleForm)

/*
用来设置角色权限的form组件
 */
class RoleAuthForm extends PureComponent {

  /*
  渲染树状节点列表
   */
  renderTreeNodes = (data, key = '') => {
    return data.map((item) => {
      let parentKey = key + item.key
      if (item.children) {
        return (
          <TreeNode title={item.title} key={parentKey} dataRef={item}>
            {this.renderTreeNodes(item.children, parentKey)}
          </TreeNode>
        )
      }
      return <TreeNode {...item} />
    })
  }

  /*
  设置选中的节点，通过父组件方法再传递回来
   */
  onCheck = (checkedKeys) => {
    this.props.patchMenuInfo(checkedKeys);
  }

  componentWillMount() {
    this.props.setAddForm(this.props.form)
  }

  render() {
    console.log('RoleAuthForm render()')

    const {role, menus, setRoleMenus} = this.props

    return (
      <Form layout="horizontal">
        <FormItem label="角色名称：">
          <Input disabled placeholder={role.name}/>
        </FormItem>

        <Tree
          checkable
          defaultExpandAll
          checkedKeys={menus || []}
          onCheck={(checkedKeys) => setRoleMenus(checkedKeys)}
        >
          <TreeNode title="平台权限" key="platform_all">
            {this.renderTreeNodes(menuConfig)}
          </TreeNode>
        </Tree>
      </Form>
    )
  }
}

RoleAuthForm = Form.create()(RoleAuthForm)