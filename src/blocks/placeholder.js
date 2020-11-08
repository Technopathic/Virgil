
import React from 'react'
import { EditorBlock } from 'draft-js'
import {
  resetBlockWithType
} from '../model.js'

import { Section, Span } from 'proxima-ui'

const PlaceholderBlock = (props) => {

  return (
    <Span position="relative">
      {props.block.getText() === "" ?
        <Section position="absolute" top="0" left="0" right="0" zIndex="-1" color="#AAAAAA" userSelect="none">
          {
            props.blockProps.data.toJS().placeholder || 
            props.block.toJS().placeholder || 
            "Write something here..."
          }
        </Section>
      : null}
      
      <Section userSelect="none">
        <EditorBlock {...Object.assign({}, props, {})} />
      </Section>
    </Span>
  )
}

export default PlaceholderBlock


export const PlaceholderBlockConfig = (options = {}) => {
  let config = {
      renderable: true,
      editable: true,
      block: PlaceholderBlock,
      type: 'placeholder',
      breakOnContinuous: true,
      widget_options: {
        displayOnInlineTooltip: false
      },

      handleEnterWithoutText(ctx, block) {
        const { editorState } = ctx.state
        return ctx.onChange(resetBlockWithType(editorState, "unstyled"))
      },

      handleEnterWithText(ctx, block) {
        const { editorState } = ctx.state
        const data = {
          provisoryText: block.getText(),
          endpoint: block.getData().get('endpoint'),
          type: block.getData().get('type')
        }
        return ctx.onChange(resetBlockWithType(editorState, data.type, data))
      }
    }

  return Object.assign(config, options)
}



