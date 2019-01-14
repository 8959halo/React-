import React from 'react'
import PropTypes from 'prop-types'
import {Upload, Icon, Modal, message} from 'antd'

import {deleteImg} from '../../api'
import {BASE_IMG_PATH} from '../../utils/constant'

/*
图片墙(上传)组件
 */
export default class PicturesWall extends React.Component {

  static propTypes = {
    images: PropTypes.array
  }

  state = {
    previewVisible: false, // 是否显示图片预览框
    previewImage: '', // 预览图片的url
    fileList: [], // 包含所有图片文件信息的数组(显示)
  }

  // 给父组件调用的用来获取所有图片文件名数组
  getImages = () => {
    return this.state.fileList.map(file => file.name)
  }

  // 取消查看图片大图
  handleCancel = () => this.setState({previewVisible: false})

  // 响应点击预览查看图片大图
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  /*
  上传文件状态发生改变的回调
  文件3个状态: loading, down, removed
   */
  handleChange = async ({file, fileList, event}) => {
    const status = file.status
    if (status == 'done') {
      const result = file.response
      if (result.status === 0) {
        const data = result.data
        const url = data.url
        const name = data.name
        file = fileList[fileList.length - 1]
        file.url = url
        file.name = name
        console.log('handleChange', file.percent, file.status, file)
      } else {
        message.error('上传图片失败')
      }
    } else if (status === 'removed') {
      console.log('removed', file, fileList.length)
      const name = file.name
      const result = await deleteImg(name)
      if (result.status === 0) {
        message.success('图片删除成功')
      } else {
        message.error('图片删除失败')
      }
    }

    this.setState({fileList})
  }

  componentWillMount() {
    const images = this.props.imgs || []
    const fileList = images.map((image, index) => ({
      uid: -index,
      name: image,
      status: 'done',
      url: BASE_IMG_PATH + image,
    }))
    this.state.fileList = fileList
  }

  render() {
    const {previewVisible, previewImage, fileList} = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus"/>
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div className="clearfix">
        <Upload
          action="/manage/img/upload"
          accept='image/*'
          listType="picture-card"
          name='image'
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          onRemove={this.handleRemove}
        >
          {fileList.length >= 4 ? null : uploadButton}
        </Upload>

        <Modal visible={previewVisible}
               footer={null}
               onCancel={this.handleCancel}
        >
          <img alt="img" style={{width: '100%'}} src={previewImage}/>
        </Modal>
      </div>
    );
  }
}
