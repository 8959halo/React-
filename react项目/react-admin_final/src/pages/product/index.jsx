import React, {Component} from 'react'
import {
  Table,
  Icon,
  Input,
  Select,
  Button,
  Card,
  message
} from 'antd'

import {
  reqProducts,
  reqUpOrDownProduct,
  reqSearchProducts,
} from '../../api'

const Option = Select.Option

/*
商品管理的主二级路由组件
 */
export default class ProductIndex extends Component {

  state = {
    products: [], // 当前页的商品列表
    total: 0, // 后台商品的总数量
    searchType: 'productName', // 搜索的类型名称
    searchWord: '', // 搜索的关键字
  }

  /*
  异步获取指定页的商品列表
   */
  getProducts = async (index) => {

    const {searchType, searchWord} = this.state
    let result
    if (searchWord) {
      result = await reqSearchProducts({pageNum: index, pageSize: 20, searchType, searchWord})
    } else {
      result = await reqProducts(index, 20)
    }

    if (result.status === 0) {
      const {list, total} = result.data
      this.setState({
        products: list,
        total: total
      })
      message.success('获取列表成功!')
    } else {
      message.error('获取失败: ' + result.msg)
    }
  }

  /*
  显示指定商品的详情
   */
  showDetail = (product) => {
    this.props.history.push('/product/detail', product)
  }

  /*
  显示更新商品的界面
   */
  showUpdate = (product) => {
    this.props.history.push('/product/saveupdate', product)
  }

  /*
  显示添加商品的界面(与更新是同个的路由组件)
   */
  showAdd = () => {
    this.props.history.push('/product/saveupdate')
  }

  /*
  对指定商品进行上架或下架的异步更新处理
   */
  downOrUpProduct = async (product) => {
    const productId = product._id
    const status = product.status === 1 ? 2 : 1
    const result = await reqUpOrDownProduct(productId, status)
    if (result.status === 0) {
      product.status = status
      this.setState({
        products: this.state.products
      })
      message.success('更新商品状态成功')
    } else {
      message.error('操作失败: ' + result.msg)
    }
  }

  /*
  根据输入关键字搜索匹配的商品列表
   */
  search = () => {
    const searchWord = this.state.searchWord.trim()
    if (searchWord) {
      this.getProducts(1)
    }
  }

  /*
  初始化表格的字段数组
   */
  initColumns = () => {
    this.columns = [
      {
        title: '商品名称',
        dataIndex: 'name'
      },
      {
        title: '商品描述',
        dataIndex: 'desc'
      },
      {
        title: '价格',
        dataIndex: 'price',
        render: (price) => '¥' + price
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 200,
        render: (status, product) => {
          console.log('render', status, product)
          let statusText = '在售'
          let opText = '下架'
          if (status !== 1) {
            statusText = '已下架'
            opText = '上架'
          }
          return (
            <span>
              <Button type='primary' onClick={() => this.downOrUpProduct(product)}>{opText}</Button>
              &nbsp;&nbsp;&nbsp;&nbsp;<span>{statusText}</span>
            </span>
          )
        }
      },
      {
        title: '操作',
        key: 'operation',
        width: 150,
        render: (product) => {
          return (
            <span>
              <a href="javascript:;" onClick={() => this.showDetail(product)}>详情</a>&nbsp;&nbsp;
              <a href="javascript:;" onClick={() => this.showUpdate(product)}>修改</a>
            </span>
          )
        }
      },
    ]
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getProducts(1)
  }

  render() {
    const {products, total, searchType, searchWord} = this.state

    const header = (
      <Card>
        <Select value={searchType} onSelect={val => this.setState({searchType: val})}>
          <Option value='productName'>根据商品名称</Option>
          <Option value='productDesc'>根据商品描述</Option>
        </Select>
        &nbsp;&nbsp;
        <Input placeholder='关键字'
               style={{width: 200}}
               value={searchWord}
               onChange={e => this.setState({searchWord: e.target.value})}/>
        &nbsp;&nbsp;
        <Button type='primary' onClick={this.search}>搜索</Button>
        <Button type="primary" onClick={this.showAdd} style={{float: 'right'}}>
          <Icon type="plus"/>添加产品
        </Button>
      </Card>
    )

    return (
      <div>
        {header}

        <Table
          rowKey='_id'
          columns={this.columns}
          dataSource={products}
          bordered
          pagination={{
            defaultPageSize: 20,
            total,
            showQuickJumper: true,
            onChange: this.getProducts
          }}
        />
      </div>
    )
  }
}