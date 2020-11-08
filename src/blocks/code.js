import React, { useState, useEffect } from 'react'
import { addNewBlockAt, getCurrentBlock } from '../model.js'
import axios from "axios"
import {code} from "../icons.js"

import SyntaxHighlighter from 'react-syntax-highlighter'
import { nord, githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs'

const CodeBlock = (props) => {
  const [data, setData] = useState('')

  useEffect(() => {
    if(!dataForUpdate().provisoryText) { return }

    getData()
  }, [])

  const dataForUpdate = () => {
    return props.blockProps.data.toJS();
  }

  const insertData = () => {
    let { blockProps } = props;
    let { getEditorState, setEditorState } = blockProps;
    const currentBlock = getCurrentBlock(getEditorState())

    setEditorState(addNewBlockAt(getEditorState(), currentBlock.getKey()))

    return
  }

  const getData = () => {
    insertData()

    return axios({
      method:'GET',
      url: dataForUpdate().provisoryText
    })
    .then(result => setData(result.data))
  }
  

  return (
    <SyntaxHighlighter
      customStyle={{fontSize: '16px', padding: "10px 10px"}}
      style={props.light ? githubGist : nord}
      language={props.language || "auto"} 
      showLineNumbers={
          props.showLineNumbers ? props.showLineNumbers :
          process.env.SHOW_LINE_NUMBERS 
      }>
      {data}
    </SyntaxHighlighter>
  )

}

export const CodeBlockConfig = (options = {}) => {
  let config = {
      title: 'insert code',
      editable: false, 
      type: 'codeBlock',
      icon: code,
      block: CodeBlock,
      renderable: true,
      breakOnContinuous: true,
      widget_options: {
        displayOnInlineTooltip: true,
        insertion: "placeholder",
        insert_block: "codeBlock"
      },
      options: {
        placeholder: 'Paste a link to your Gist or hosted Code'
      },

      handleEnterWithoutText(ctx, block) {
        const { editorState } = ctx.state
        return ctx.onChange(addNewBlockAt(editorState, block.getKey() || block.key))
      },

      handleEnterWithText(ctx, block) {
        const { editorState } = ctx.state
        return ctx.onChange(addNewBlockAt(editorState, block.getKey() || block.key))
      }
  }

  return Object.assign(config, options)
}
