import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Table,
  Icon,
  Modal,
  Input,
  Form,
  Select,
  Card,
  message
} from 'antd'
import {
  reqCategorys,
  reqUpdateCategory,
  reqAddCategory
} from '../../api'

const Option = Select.Option

/*
分类管理的路由组件
 */
export default class Category extends Component {

  state = {
    parentId: 0, // 父级分类的id
    parentName: '', // 父级分类的名称
    categorys: [], // 所有一级分类的数组
    subCategorys: [], // 需要显示的二级分类的数组
    isShowUpdate: false, // 是否显示用于更新分类的对话框
    isShowAdd: false, // 是否显示用于添加的对话框
  }

  /*
  显示添加界面
   */
  showAdd = () => {
    this.setState({
      isShowAdd: true
    })
  }

  /*
  添加分类
   */
  addCategory = async () => {
    const {parentId, categoryName} = this.form.getFieldsValue()
    // console.log('data', data)
    this.setState({isShowAdd: false})
    this.form.resetFields()

    const result = await reqAddCategory(parentId, categoryName)
    if (result.status === 0) {
      message.success('添加分类成功')
      if (parentId === this.state.parentId) {
        this.getCategorys()
      }
    } else {
      message.error('添加失败: ' + result.msg)
    }
  }

  /*
  根据当前的parentId得到分类(一级/二级)列表并更新状态
   */
  getCategorys = async () => {
    const parentId = this.state.parentId
    const result = await reqCategorys(parentId)
    if (result.status === 0) {
      const categorys = result.data
      if (parentId === 0) {
        this.setState({
          categorys
        })
      } else {
        this.setState({
          subCategorys: categorys
        })
      }
    }
  }

  /*
  显示指定分类的子分类列表
   */
  showSubCategorys = async (category) => {
    // 更新父分类id和名称
    this.setState({
      parentId: category._id,
      parentName: category.name
    }, () => {
      this.getCategorys()
    })
  }


  /*
  显示更新分类的框
   */
  showUpdateCategory = (category) => {
    this.category = category
    this.setState({
      isShowUpdate: true
    })
  }

  /*
  更新分类
   */
  updateCategory = async () => {
    const {category} = this
    const categoryName = this.form.getFieldValue('categoryName')
    this.setState({
      isShowUpdate: false,
    })
    const result = await reqUpdateCategory(category._id, categoryName)
    if (result.status === 0) {
      this.getCategorys()
    }
  }

  /*
  初始化表单的字段数组(只用执行一次)
   */
  initColumns = () => {
    this.columns = [
      {
        title: '品类名称',
        dataIndex: 'name'
      },
      {
        title: '操作',
        key: 'operation',
        width: 300,
        render: (category) => {
          return (
            <span>
              <a href="javascript:;" onClick={() => this.showUpdateCategory(category)}>修改名称</a>&nbsp;&nbsp;
              {
                this.state.parentId === 0
                  ? <a href="javascript:;" onClick={() => this.showSubCategorys(category)}>查看其子品类</a>
                  : null
              }
            </span>
          )
        }
      },
    ]
  }

  /*
  显示一级分类列表
   */
  showFirstCategorys = () => {
    this.setState({
      parentId: 0,
      parentName: '',
      subCategorys: [],
    })
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getCategorys()
  }

  render() {

    const {parentId, parentName, categorys, subCategorys, isShowUpdate, isShowAdd} = this.state
    const category = this.category || {}

    const header = (
      <Card style={{fontSize: 18}}>
        {
          parentId === 0 ? (
            <span>一级分类列表</span>
          ) : (
            <span>
              <a href="javascript:" onClick={this.showFirstCategorys}>一级分类</a>
              <Icon type='arrow-right' style={{marginLeft: 10, marginRight: 10}}/>
              {parentName}
            </span>
          )
        }
        <Button type="primary"
                onClick={this.showAdd}
                style={{float: 'right'}}>
          <Icon type="plus"/>添加品类
        </Button>
      </Card>
    )

    return (
      <div>
        {header}
        <Table
          rowKey='_id'
          columns={this.columns}
          dataSource={parentId === 0 ? categorys : subCategorys}
          loading={categorys.length === 0}
          bordered
          pagination={{defaultPageSize: 10, showQuickJumper: true, showSizeChanger: true}}
        />

        <Modal visible={isShowUpdate}
               closable={false}
               title='更新分类'
               width={300}
               onCancel={() => this.setState({isShowUpdate: false})}
               onOk={this.updateCategory}
        >
          <UpdateForm categoryName={category.name} setForm={form => this.form = form}/>
        </Modal>

        <Modal visible={isShowAdd}
               title='添加分类'
               onCancel={() => {
                 this.setState({isShowAdd: false})
                 this.form.resetFields()
               }}
               onOk={this.addCategory}
        >
          <AddForm categorys={categorys} setForm={form => this.form = form}/>
        </Modal>
      </div>
    )
  }
}


/*
更新分类的Form组件
 */
class UpdateForm extends Component {

  static propTypes = {
    categoryName: PropTypes.string.isRequired,
    setForm: PropTypes.func.isRequired
  }

  componentWillMount() {
    const form = this.props.form
    this.props.setForm(form)
  }

  render() {
    const {categoryName} = this.props
    const {getFieldDecorator} = this.props.form
    return (
      <Form>
        <Form.Item>
          {
            getFieldDecorator('categoryName', {
              initialValue: categoryName,
            })(<Input/>)
          }
        </Form.Item>
      </Form>
    )
  }
}

UpdateForm = Form.create()(UpdateForm)


/*
添加分类的Form组件
 */
class AddForm extends Component {

  static propTypes = {
    categorys: PropTypes.array.isRequired,
    setForm: PropTypes.func.isRequired
  }

  componentWillMount() {
    const form = this.props.form
    this.props.setForm(form)
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {categorys} = this.props
    const options = categorys.map(c => (
      <Option key={c._id} value={c._id}>{c.name}</Option>
    ))
    return (
      <Form>
        <Form.Item label="所属分类">
          {
            getFieldDecorator('parentId', {
              initialValue: "0"
            })(
              <Select>
                <Option value="0">一级分类</Option>
                {options}
              </Select>
            )
          }
        </Form.Item>

        <Form.Item label="分类名称">
          {
            getFieldDecorator('categoryName', {
              initialValue: ''
            })(
              <Input placeholder='输入分类名称'/>
            )
          }
        </Form.Item>
      </Form>
    )
  }
}

AddForm = Form.create({})(AddForm)