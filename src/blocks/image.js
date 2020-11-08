/** @jsx jsx */

import { useState, useEffect } from 'react'
import { jsx } from '@emotion/core'
import axios from 'axios'
import { resetBlockWithType, updateDataOfBlock, addNewBlockAt, getCurrentBlock } from '../model.js'
import {image} from "../icons.js"

import { Media } from 'proxima-ui'

const ImageBlock = (props) => {
  let existingData = props.block.getData().toJS()
  let imageTag = null
  let file = props.blockProps.data.get('file')

  const defaultUrl = (data)=> {
    if (data.url) { return data.url }

    if (data.url) {
      if (data.file) {
        return URL.createObjectURL(data.file)
      } else {
        return data.url
      }
    } else {
      return this.props.blockProps.data.src
    }
  }

  const [ loading, setLoading ] = useState(false)
  const [loadingProgress, setLoadingProgress ] = useState(loadingProgress)
  const [url, setUrl] = useState(props.blockProps.data.src || defaultUrl(existingData))

  useEffect(() => {
    return replaceImg()
  }, [])

  const updateData = () => {
    let { blockProps, block } = props;
    let { getEditorState, setEditorState } = blockProps;
    let data = block.getData();
    let newData = data.merge(existingData);

    return setEditorState(updateDataOfBlock(getEditorState(), block, newData))
  }

  const insertData = () => {
    let { blockProps } = props;
    let { getEditorState, setEditorState } = blockProps;
    const currentBlock = getCurrentBlock(getEditorState())

    setEditorState(addNewBlockAt(getEditorState(), currentBlock.getKey()))

    return
  }

  const uploadFile = async() => {
    insertData()
    props.blockProps.addLock();

    const imageUpload = await props.blockPops.getEditor().props.imageUpload(formatBase64Data())

    existingData.url = imageUpload
    existingData.file = ""
    file = null
    props.blockProps.removeLock()
    updateData()
  }

  const replaceImg = () => {
    let img = new Image()
    img.src = url
    setUrl(img.src)

    if (!img.src.includes("blob:")) {
      return
    }

    if(props.blockProps.getEditor().props.imageUpload) {
      return img.onload = () => {
        return handleUpload();
      }
    }
  }

  const handleUpload = () => {
    setLoading(true)
    updateData();
    return uploadFile();
  }

  const formatBase64Data = () => {
    if(file) {
      let formData = JSON.stringify({
        image: file
      });

      return formData;
    } else {
      let formData = JSON.stringify({
        url: props.blockProps.data.get("url")
      });

      return formData;
    }
  }

  const validateLink = (str) => {
    let url;

    try {
      url = new URL(str);
    } catch (err) {
      return false;  
    }

    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "blob:";
  }

  const getMediaWrapper = () => {
    return props.blockProps.getEditor().props.mediaWrapper
  }

  if(validateLink(url)) {
    if(!getMediaWrapper()) {
      return (
        <Media noWrapper>
          <img src={url}
            ref={(ref) => imageTag = ref }
            contentEditable={false}
            alt={url}
          />
        </Media>
      )
    } else {
      return (
        <Media>
          <img src={url}
            ref={(ref) => imageTag = ref }
            contentEditable={false}
            alt={url}
          />
        </Media>
      )
    }
  } else {
    resetBlockWithType(props.blockProps.getEditorState())
    return ""
  }
}

export const ImageBlockConfig = ( options = {} ) => {
  let config =  {
    title: 'add an image',
    type: 'image',
    icon: image,
    block: ImageBlock,
    editable: false,
    renderable: true,
    breakOnContinuous: true,
    
    handleEnterWithoutText(ctx, block) {
      const { editorState } = ctx.state
      return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
    },
    handleEnterWithText(ctx, block) {
      const { editorState } = ctx.state
      return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
    },
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: "upload",
      insert_block: "image"
    }  
  }
  
  return Object.assign(config, options)
}


