/** @jsx jsx */

import { useState, useEffect } from 'react'
import { jsx } from '@emotion/core'
import { updateDataOfBlock, addNewBlockAt, getCurrentBlock } from '../model.js'
import axios from "axios"
import {video} from "../icons.js"

import { Media } from 'proxima-ui'

const VideoBlock = (props) => {

  const defaultData = () => {
    let existingData = props.block.getData().toJS();
    return existingData.embedData || {}
  }

  const updateData = () => {
    const { block, blockProps } = props;
    const { getEditorState, setEditorState } = blockProps;
    const data = block.getData();
    const newData = data.merge({embedData});
    return setEditorState(updateDataOfBlock(getEditorState(), block, newData));
  }

  const dataForUpdate = () => {
    return props.blockProps.data.toJS();
  }

  const getMediaWrapper = () => {
    return props.blockProps.getEditor().props.mediaWrapper
  }

  const [embedData, setEmbedData] = useState(defaultData())

  useEffect(() => {
    if (!props.blockProps.data) { return }
    if (!dataForUpdate().endpoint && !dataForUpdate().provisoryText) { return }

    getEmbedData();
  }, [])

  const insertData = () => {
    let { blockProps } = props;
    let { getEditorState, setEditorState } = blockProps;
    const currentBlock = getCurrentBlock(getEditorState())

    setEditorState(addNewBlockAt(getEditorState(), currentBlock.getKey()))

    return
  }

  const getEmbedData = () => {
    insertData()

    return axios({
      method: 'GET',
      url: `${ dataForUpdate().endpoint }${ dataForUpdate().provisoryText }&scheme=https`
    })
    .then(result => { return (setEmbedData(result.data), updateData()) })
  }

  const renderEmbedHtml = () =>{
    if (dataForUpdate().mediaRenderHandler){
      return dataForUpdate().mediaRenderHandler()
    }else{
      return embedData.media ? embedData.media.html : embedData.html
    }
    
  }

  if(!getMediaWrapper()) {
    return (
      <Media noWrapper>
        <div dangerouslySetInnerHTML={ { __html: renderEmbedHtml() } } />
      </Media>
    )
  } else {
    return (
      <Media>
        <div dangerouslySetInnerHTML={ { __html: renderEmbedHtml() } } />
      </Media>
    )
  }
  
  
}

export const VideoBlockConfig = (options = {}) => {
  let config = {
      title: 'insert video',
      editable: false, 
      type: 'video',
      icon: video,
      block: VideoBlock,
      renderable: true,
      breakOnContinuous: true,
      widget_options: {
        displayOnInlineTooltip: true,
        insertion: "placeholder",
        insert_block: "video"
      },
      options: {
        endpoint: '//noembed.com/embed?url=',
        placeholder: 'Paste a YouTube or other video link, and press Enter',
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
