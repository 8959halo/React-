import React, {Component} from 'react'
import {List, Icon} from 'antd'

import {reqCategory} from '../../api'
import {BASE_IMG_PATH} from '../../utils/constant'

/*
商品详情组件
 */
export default class ProductDetail extends Component {

  state = {
    cName1: '',
    cName2: ''
  }

  /*
  异步获取当前产品对应的分类名称
   */
  getCategoryName = async () => {
    const {categoryId, pCategoryId} = this.props.location.state
    let cName1, cName2
    if (pCategoryId === '0') {
      const result = await reqCategory(categoryId)
      cName1 = result.data.name
    } else {

      /*
      const result1 = await reqCategory(pCategoryId)
      const result2 = await reqCategory(categoryId)
      cName1 = result1.data.name
      cName2 = result2.data.name
      */

      const results = await Promise.all([reqCategory(pCategoryId), reqCategory(categoryId)])
      console.log('results', results)
      cName1 = results[0].data.name
      cName2 = results[1].data.name
    }
    console.log(cName1, cName2)
    this.setState({
      cName1,
      cName2
    })
  }

  componentDidMount() {
    this.getCategoryName()
  }

  render() {
    const {name, desc, price, categoryId, pCategoryId, imgs, detail} = this.props.location.state
    const {cName1, cName2} = this.state
    return (
      <div className='product-detail'>
        <h1>
          <Icon type="arrow-left" onClick={() => this.props.history.goBack()}/>&nbsp;&nbsp;
          商品详情
        </h1>

        <List>
          <List.Item>
            <span className='left'>商品名称:</span>
            <span>{name}</span>
          </List.Item>
          <List.Item>
            <span className='left'>商品描述:</span>
            <span>{desc}</span>
          </List.Item>
          <List.Item>
            <span className='left'>商品价格:</span>
            <span>{price + '元'}</span>
          </List.Item>
          <List.Item>
            <span className='left'>所属分类:</span>
            <span>{cName1 + '-->' + cName2}</span>
          </List.Item>
          <List.Item>
            <span className='left'>商品图片:</span>
            <span>
              {
                imgs.map(img => (
                  <img src={BASE_IMG_PATH + img} alt="img" key={img}
                       style={{width: 150, height: 150, marginRight: 10}}/>
                ))
              }
            </span>
          </List.Item>

          <List.Item>
            <span className='left'>商品详情:</span>
            <div dangerouslySetInnerHTML={{__html: detail}}></div>
          </List.Item>
        </List>
      </div>
    )
  }
}