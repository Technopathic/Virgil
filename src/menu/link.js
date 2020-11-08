
import React, {useState, useRef} from 'react'

import { getRelativeParent } from "../utils/selection.js"

const AnchorPopover = (props) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [show, setShow] = useState(false)
  const [url, setUrl] = useState("")

  const popover = useRef(null)

  const relocate = (node) => {

    if (!node) {
      return
    }

    const { editorState } = props

    let selectionRect = node.getBoundingClientRect()

    let parent = ReactDOM.findDOMNode(props.editor)

    const relativeParent = getRelativeParent(refs.popover.parentElement);
    const toolbarHeight = refs.popover.clientHeight;
    const toolbarWidth = refs.popover.clientWidth;
    const relativeRect = (relativeParent || document.body).getBoundingClientRect();

    if(!relativeRect || !selectionRect)
      return

    let top = (selectionRect.top - relativeRect.top) + (toolbarHeight * 0.6)
    let left = (selectionRect.left - relativeRect.left + (selectionRect.width / 2) ) - ( toolbarWidth / 2 )

    if (!top || !left) {
      return
    }

    return {
      top: top,
      left: left
    }
  }

  return (
    <section
      ref={popover}
      style={{left: position.left, top: position.top, visiblity:`${show ? 'visible' : 'hidden'}`} }
      onMouseOver={ props.handleOnMouseOver }
      onMouseOut={ props.handleOnMouseOut }
    >
      <a href={ url } target='_blank'>
        { url }
      </a>
    </section>
  )
}

export default AnchorPopover


export const AnchorPopoverConfig = ( options = {} ) => {
  let config = {
      ref: 'anchorPopover',
      component: AnchorPopover
  } 
  return Object.assign(config, options)
}
