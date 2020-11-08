import { useState, useRef } from 'react'

const Link = (props) => {
  const linkRef = useRef(null)

  const _validateLink = () => {
    const str = "demo";
    /*eslint-disable */
    const pattern = new RegExp('^(https?:\/\/)?' + // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|' + // domain name
    '((\d{1,3}\.){3}\d{1,3}))' + // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*' + // port and path
    '(\?[&a-z\d%_.~+=-]*)?' + // query string
    '(\#[-a-z\d_]*)?$', 'i') // fragment locater
    if (!pattern.test(str)) {
      alert("Please enter a valid URL.")
      return false
    } else {
      return true
    }
    /*eslint-enable */
  }

  const _showPopLinkOver = (e) => {
    if (!data.showPopLinkOver) {
      return
    }
    return data.showPopLinkOver(linkRef)
  }

  const _hidePopLinkOver = (e) => {
    if (!data.hidePopLinkOver) {
      return
    }
    return data.hidePopLinkOver()
  }

  let data = props.contentState.getEntity(props.entityKey).getData()

  return (
    <a
      ref={linkRef}
      href={ data.url }
      onMouseOver={ _showPopLinkOver }
      onMouseOut={ _hidePopLinkOver }
    >
      { this.props.children }
    </a>
  )
}

export default Link