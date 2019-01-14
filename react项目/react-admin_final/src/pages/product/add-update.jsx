import React, {Component} from 'react'
import {Form, Input, Select, Button, Icon, message} from 'antd'

import PicturesWall from './pictures-wall'
import RichTextEditor from './rich-text-editor'

import {reqCategorys, reqAddOrUpdateProduct} from '../../api'

const Option = Select.Option

/*
商品添加/更新的二级路由组件
 */
class ProductAddUpdate extends Component {

  state = {
    categorys: [], // 一级分类列表
    subCategorys: [], // 某个二级分类的列表
    parentId: '', // 父级分类的ID
  }

  /*
  获取指定分类的子分类列表, 如果parentId为0获取一级分类列表
   */
  getCategorys = async (parentId = '0') => {
    const result = await reqCategorys(parentId)
    if (result.status === 0) {
      const categorys = result.data
      if (parentId === '0') {
        this.setState({
          parentId,
          categorys,
          subCategorys: []
        })
      } else {
        this.setState({
          parentId,
          subCategorys: categorys
        })
      }
    }
  }

  /*
  处理一级列表项改变事件, 获取对应的子分类列表
   */
  onSelectChange = value => {
    this.getCategorys(value)
  }

  /*
  添加/更新商品
   */
  submit = async (event) => {
    // 阻止事件的默认行为
    event.preventDefault()

    // 收集用户输入的数据, 并封装为商品对象
    const {name, desc, price, categoryId1, categoryId2} = this.props.form.getFieldsValue()
    const detail = this.refs.editor.getContent()
    const imgs = this.refs.imgs.getImages()
    const newProduct = {name, desc, price, detail, imgs}
    if (!categoryId2 || categoryId2 === '未选择') {
      newProduct.categoryId = categoryId1
      newProduct.pCategoryId = '0'
    } else {
      newProduct.categoryId = categoryId2
      newProduct.pCategoryId = categoryId1
    }

    // 如果是更新, 指定id
    const product = this.props.location.state
    if (product && product._id) {
      newProduct._id = product._id
    }

    // 异步请求后台
    const result = await reqAddOrUpdateProduct(newProduct)
    // 如果成功了, 返回到商品主界面显示新的列表
    if (result.status === 0) {
      this.props.history.goBack()
    } else {
      message.error(result.msg || '操作失败')
    }
  }

  componentDidMount() {
    // 获取一级列表显示
    this.getCategorys()

    // 如果是更新, 且商品是二级分类下的, 获取相应的二级分类列表
    const product = this.props.location.state
    if (product && product.pCategoryId !== '0') {
      this.getCategorys(product.pCategoryId)
    }
  }

  render() {
    const {categorys, subCategorys} = this.state
    const product = this.props.location.state || {}
    const imgs = product.imgs

    let options, subOptions
    if (categorys.length > 0) {
      options = categorys.map(category => (<Option key={category._id} value={category._id}>{category.name}</Option>))
    }
    if (subCategorys.length > 0) {
      subOptions = subCategorys.map(category => (
        <Option key={category._id} value={category._id}>{category.name}</Option>))
    }

    let initCategoryId1 = '未选择'
    if (categorys.length > 0) {
      if (product.pCategoryId === '0') {
        initCategoryId1 = product.categoryId
      } else if (product.pCategoryId) {
        initCategoryId1 = product.pCategoryId
      }
    }

    let initCategoryId2 = '未选择'
    if (subCategorys.length > 0) {
      initCategoryId2 = product.categoryId || '未选择'
    }

    const {getFieldDecorator} = this.props.form

    const formItemLayout = {
      labelCol: {
        sm: {span: 2},
      },
      wrapperCol: {
        sm: {span: 12},
      },
    }


    return (
      <div style={{paddingLeft: 30}}>
        <h1>
          <Icon type="arrow-left" onClick={() => this.props.history.goBack()}/>&nbsp;&nbsp;
          {product._id ? '编辑商品' : '添加商品'}
        </h1>
        <Form>
          <Form.Item label='商品名称' {...formItemLayout}>
            {
              getFieldDecorator('name', {
                initialValue: product.name
              })(
                <Input placeholder='请输入商品名称'/>
              )
            }
          </Form.Item>

          <Form.Item label='商品描述' {...formItemLayout}>
            {
              getFieldDecorator('desc', {
                initialValue: product.desc
              })(
                <Input placeholder='请输入商品描述'/>
              )
            }
          </Form.Item>

          <Form.Item label='所属分类' {...formItemLayout}>
            {
              getFieldDecorator('categoryId1', {
                initialValue: initCategoryId1
              })(
                <Select style={{width: 200}} onChange={this.onSelectChange}>
                  {options}
                </Select>
              )
            }
            &nbsp;&nbsp;
            {
              subCategorys.length > 0 ? getFieldDecorator('categoryId2', {
                initialValue: initCategoryId2
              })(
                <Select style={{width: 200}}>
                  {subOptions}
                </Select>
              ) : null
            }
          </Form.Item>

          <Form.Item label='商品价格' {...formItemLayout}>
            {
              getFieldDecorator('price', {
                initialValue: product.price
              })(
                <Input
                  type='number'
                  style={{width: 200}}
                  placeholder='请输入商品价格'
                  addonAfter='元'
                />
              )
            }
          </Form.Item>

          <Form.Item label='商品图片' {...formItemLayout}>
            <PicturesWall ref='imgs' imgs={imgs}/>
          </Form.Item>

          <Form.Item label='商品详情' labelCol={{sm: {span: 2}}} wrapperCol={{sm: {span: 19}}}>
            <RichTextEditor ref='editor' html={product.detail}/>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{width: 100}}
              onClick={this.submit}
            >
              提交
            </Button>
          </Form.Item>
        </Form>

      </div>
    )
  }
}

export default Form.create({})(ProductAddUpdate)