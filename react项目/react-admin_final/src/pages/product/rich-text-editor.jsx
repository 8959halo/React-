import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {EditorState, convertToRaw, ContentState} from 'draft-js'
import {Editor} from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import htmlToDraft from 'html-to-draftjs'

/*
富文本编辑器组件
 */
export default class RichTextEditor extends Component {

  static propTypes = {
    html: PropTypes.string
  }

  constructor(props) {
    super(props)
    const {html} = this.props
    // 如果指定的页面文本, 需要初始化编辑状态数据中
    if (html) {
      const blocksFromHtml = htmlToDraft(html)
      const {contentBlocks, entityMap} = blocksFromHtml
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
      const editorState = EditorState.createWithContent(contentState)
      this.state = {
        editorState: editorState
      }
    // 指定一个空的编辑状态数据
    } else {
      this.state = {
        editorState: EditorState.createEmpty()
      }
    }
  }

  // 给父组件调用的方法:用来获取输入的html文本
  getContent = () => {
    return draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
  }

  // 当输入发生改变时的回调: 更新编辑状态数据
  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    })
  }

  render() {
    const {editorState} = this.state
    return (
      <div>
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={this.onEditorStateChange}
        />
      </div>
    )
  }
}