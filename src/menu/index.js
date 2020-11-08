import React, { useRef, useState } from 'react'
import { Entity, RichUtils } from 'draft-js'
import { addNewBlock, addNewBlockAt, resetBlockWithType, getCurrentBlock } from '../model.js'

import { Column, Row, Button, List, ListItem, Icon, Grid, Input, Drawer, P } from 'proxima-ui'

import Icons from "../icons.js"

const Menu = (props) => {
  const [linkMode, setLinkMode] = useState(false)
  const [emptyMode, setEmptyMode] = useState(false)
  const [virgilMenu, setVirgilMenu] = useState(false)

  const menuInput = useRef(null)
  const fileInput = useRef(null)

  const clickOnFileUpload = () => {
    fileInput.current.click()
  }

  const handlePlaceholder = (input) => {
    let opts = {
      type: input.widget_options.insert_block,
      placeholder: input.options.placeholder,
      endpoint: input.options.endpoint
    }

    return props.onChange(resetBlockWithType(props.editorState, 'placeholder', opts))
  }

  const handleFileInput = (e) => {
    e.preventDefault();
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      let opts = {
        url: URL.createObjectURL(file),
        file: reader.result
      };

      fileInput.current.value = "";
      props.onChange(addNewBlock(props.editorState, 'image', opts))
      return
    } 

      
    setTimeout(() => {
      addNewBlockAt(props.editorState, getCurrentBlock(props.editorState).getKey())

      props.editor.editor.current.focus()
    }, 100)

    reader.readAsDataURL(file);
  }

  const handleInsertion = (e) => {
    return props.onChange(addNewBlock(props.editorState, e.type, {}))
  }

  const widgets = () => {
    return props.editor.props.widgets
  }

  const clickHandler = (e, type) => {
   
    let request_block = widgets().find(o => o.type === type)
    switch (request_block.widget_options.insertion) {
      case "upload":
        return clickOnFileUpload(e, request_block)
      case "placeholder":
        return handlePlaceholder(request_block)
      case "insertion":
        return handleInsertion(request_block)
      default:
        return console.log(`WRONG TYPE FOR ${ request_block.widget_options.insertion }`)
    }
  }

  const getItems = () => {
    return widgets().filter(o => {
      return o.widget_options ? o.widget_options.displayOnInlineTooltip : null
    })
  }


  const _clickBlockHandler = (ev, style) => {
    ev.preventDefault()
    props.onChange(RichUtils.toggleBlockType(props.editorState, style))
    setVirgilMenu(false)
    setTimeout(() => {
      props.editor.editor.current.focus()
    }, 0)
  }

  const _clickInlineHandler = (ev, style) => {
    ev.preventDefault()
    props.onChange(RichUtils.toggleInlineStyle(props.editorState, style))
    setVirgilMenu(false)
    setTimeout(() => {
      props.editor.editor.current.focus()
    }, 0)

  }

  const _clickBlockInlineStyle = (ev, style) => {
    let k = Object.keys(style)[0]
    props.onChange(props.style[k].toggle(props.editorState, style[k]))
    setVirgilMenu(false) 
  }

  const _enableLinkMode = (ev) => {
    ev.preventDefault()
    setVirgilMenu(false)
    setLinkMode(!linkMode)
    setEmptyMode(false)
  }

  const _enableEmptyMode = (ev) => {
    ev.preventDefault()
    setVirgilMenu(false)
    setEmptyMode(!emptyMode)
  }

  const _disableLinkMode = (ev) => {
    ev.preventDefault()
    setLinkMode(false)
    setEmptyMode(false)
  }

  const handleInputEnter = (e) => {
    if (e.which === 13) {
      return confirmLink(e)
    }
  }

  const confirmLink = (e) => {
    e.preventDefault()
    if(menuInput.current.value === "") {
      return _disableLinkMode(e)
    } else {
      let { editorState } = props
      let urlValue = e.currentTarget.value
      let selection = editorState.getSelection();

      let opts = {
        url: urlValue,
        showPopLinkOver: props.showPopLinkOver,
        hidePopLinkOver: props.hidePopLinkOver
      }

      let entityKey = Entity.create('LINK', 'MUTABLE', opts)
    
      props.onChange(RichUtils.toggleLink(editorState, selection, entityKey))

      return _disableLinkMode(e)
    }
  }

  const inlineItems = () => {
    return props.widget_options.block_types.filter(o => {
      return o.type === "inline"
    })
  }

  const blockItems = () => {
    return props.widget_options.block_types.filter(o => {
      return o.type === "block"
    })
  }

  const getDefaultValue = () => {
    if (menuInput) {
      menuInput.current.value = ""
    }

    let currentBlock = getCurrentBlock(props.editorState)
    let selection = props.editor.state.editorState.getSelection()
    let contentState = props.editorState.getCurrentContent()
    let selectedEntity = null
    let defaultUrl = null
    return currentBlock.findEntityRanges(character => {
      let entityKey = character.getEntity()
      selectedEntity = entityKey
      return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK'
    }, (start, end) => {
      let selStart = selection.getAnchorOffset()
      let selEnd = selection.getFocusOffset()
      if (selection.getIsBackward()) {
        selStart = selection.getFocusOffset()
        selEnd = selection.getAnchorOffset()
      }

      if (start === selStart && end === selEnd) {
        defaultUrl = contentState.getEntity(selectedEntity).getData().url
        return menuInput.current.value = defaultUrl
      }
    })
  }

  const linkBlock = () => {
    return props.widget_options.block_types.find((o) => o.type === "link")
  }

  return (
    <React.Fragment>
      <Column width="100%" maxWidth="768px" margin="0 auto" padding="0 5px">
        {
          linkMode ?
            <Row alignItems="center" padding="5px 0px">
              <Input
                ref={menuInput}
                placeholder="Insert a URL and hit Enter"
                onKeyPress={ handleInputEnter }
              />
              <Icon onClick={ _disableLinkMode } margin="-10px 0px 0px 0px">
                {Icons['close']()}
              </Icon>
            </Row> : null
        }
        { emptyMode ?
          <Row alignItems="center" padding="5px 0px 20px 0px" justifyContent="space-between">
            <P color="#AAAAAA">Highlight text to insert your link</P>
            <Icon onClick={ _disableLinkMode }>
              {Icons['close']()}
            </Icon>
          </Row> : null
        }
        <Row minHeight="34px" justifyContent="space-between" alignItems="center" width="100%" hideMobile>
          <List type="none" flexDirection="row" alignItems="center">
            {props.widget_options.block_types.map((item, i) => {
              switch (item.type) {
                case "block":
                  return <MenuItem
                    key={ i }
                    item={ item }
                    style={props.style}
                    handleClick={ _clickBlockHandler }
                    editorState={ props.editorState }
                    type="block"
                  />

                case "inline":
                  return <MenuItem
                    key={ i }
                    item={ item }
                    style={props.style}
                    editorState={ props.editorState }
                    handleClick={ _clickInlineHandler }
                    type="inline"
                  />

                case "separator":
                  return <MenuDivider key={ i }/>

                case "link":
                  return <MenuLink
                    key={ i }
                    editorState={ props.editorState }
                    enableLinkMode={ _enableLinkMode }
                    enableEmptyMode={ _enableEmptyMode }
                    linkMode={linkMode}
                    emptyMode={emptyMode}
                  />
                default:
                  break;
              }

            })}
          </List>
          <List type="none" flexDirection="row" justifyContent="flex-end" alignItems="center">
            <Row alignItems="center">
              {getItems().map( (item, i) => {
                return  <InlineMenuItem
                          item={ item }
                          key={ i }
                          clickHandler={ clickHandler }
                        />
                })
              }
          
                <input
                  type="file"
                  accept="image/*"
                  style={ { display: 'none' } }
                  ref={fileInput}
                  multiple="multiple"
                  onChange={ handleFileInput }
                />
            </Row>
          </List>
        </Row>
        <Row hide width="100%" maxWidth="425px" padding="10px 10px">
          <Button onClick={() => setVirgilMenu(!virgilMenu)} rounded="true">Menu</Button>
        </Row>
      </Column>
      <Drawer showFunc={() => setVirgilMenu(false)} show={virgilMenu} bottom="0px" left="0px" right="0px" slideDown width="100%">
        <Grid columns="repeat(3, 1fr)" gap="15px">
          {props.widget_options.block_types.map((item, i) => {
            switch (item.type) {
              case "block":
                return <MenuItem
                  mobile
                  key={ i }
                  item={ item }
                  style={props.style}
                  handleClick={ _clickBlockHandler }
                  editorState={ props.editorState }
                  type="block"
                />

              case "inline":
                return <MenuItem
                  mobile
                  key={ i }
                  item={ item }
                  type="inline"
                  editorState={ props.editorState }
                  handleClick={ _clickInlineHandler }
                />

              case "link":
                return <MenuLink
                  mobile
                  key={ i }
                  editorState={ props.editorState }
                  enableLinkMode={ _enableLinkMode }
                  enableEmptyMode={ _enableEmptyMode }
                  linkMode={linkMode}
                  emptyMode={emptyMode}
                />
              default:
                break;
            }

          })}
          {getItems().map( (item, i) => {
              return  <InlineMenuItem
                  mobile
                  item={ item }
                  key={ i }
                  clickHandler={ clickHandler }
                />
            })}
        
            <input
              type="file"
              accept="image/*"
              style={ { display: 'none' } }
              ref={fileInput}
              multiple="multiple"
              onChange={ handleFileInput }
            />

        </Grid>
      </Drawer>
    </React.Fragment>
  )
}

const MenuDivider = (props) => {
  if(props.mobile) {
    return <br />
  } else {
    return <ListItem width="1px" height="calc(42px - 18px)" margin="9px 2px" background="#000000" />
  }
}

const MenuItem = (props) => {
  const [active, setActive] = useState("")
 
  const handleClick = (ev) => {
    return props.handleClick(ev, props.item.style)
  }

  const activeClassInline = () => {
    if (!props.editorState || !props.editorState.getCurrentContent().hasText()) {
      return
    }
    
    return props.editorState.getCurrentInlineStyle().has(props.item.style)
  }

  const activeClassBlock = () => {

    if (!props.editorState && !props.editorState.getCurrentContent().hasText()) {
      return
    }

    let selection = props.editorState.getSelection()
    let blockKey  = props.editorState.getCurrentContent().getBlockForKey(selection.getStartKey())
    if(!blockKey) return
    let blockType = blockKey.getType()

    if(props.item.style === blockType) {
      return true
    } else {
      return false
    }
  }

  if(props.mobile) {
    return (
      <Button onClick={handleClick} rounded width="100%" height="100px" background={activeClassBlock() || activeClassInline() ? "#DDDDDD" : "#EEEEEE" }>{props.item.icon()}</Button>
    )
  } else {
    return (
      <ListItem onClick={ handleClick } height="32px" display="flex" justifyContent="center" alignItems="center" background={activeClassBlock() || activeClassInline() ? "#DDDDDD" : "transparent" } rounded="true">
        <Icon>{props.item.icon()}</Icon>
      </ListItem>
    )
  }
    
}

const MenuLink = (props) => {
  const promptForLink = (ev) => {
    let selection = props.editorState.getSelection()

    if (!selection.isCollapsed()) {
      return props.enableLinkMode(ev)
    } else {
      return props.enableEmptyMode(ev)
    }
  }

  if(props.mobile) {
    return (
      <Button onClick={ promptForLink } rounded width="100%" height="100px" background={props.linkMode || props.emptyMode ? "#DDDDDD" : '#EEEEEE'}>{Icons['link']()}</Button>
    )
  } else {
    return (
      <ListItem onClick={ promptForLink } height="32px" background={props.linkMode || props.emptyMode ? "#DDDDDD" : 'transparent'} rounded="true" display="flex" justifyContent="center" alignItems="center">
        <Icon>{Icons['link']()}</Icon>
      </ListItem>
    )
  }
}

const InlineMenuItem = (props) => {
  const handleClick = (e) => {
    e.preventDefault()

    return props.clickHandler(e, props.item.type)
  }

  if(props.mobile) {
    return (
      <Button onClick={ handleClick } rounded width="100%" height="100px" background="#EEEEEE">{props.item.icon()}</Button>
    )
  }
  return (
    <ListItem onClick={ handleClick } style={{fontSize: '26px', height:'32px', width:'32px', cursor:'pointer', lineHeight:'32px', color: '#999999', marginLeft:'10px'}} rounded="true">
      <Icon>{props.item.icon()}</Icon>
    </ListItem>
  )
}

export default Menu

export const MenuConfig = (options = {}) => {
  let config =  {
    ref: 'menu',
    component: Menu,
    displayOnSelection: true,
    sticky: false,
    selectionElements: [
      "unstyled",
      "blockquote",
      "ordered-list",
      "unordered-list",
      "unordered-list-item",
      "ordered-list-item",
      "codeBlock",
      "pre",
      'header-one',
      'header-two',
      'header-three'
    ],
    widget_options: {
      placeholder: "type a url",

      block_types: [
        { label: 'p', style: 'unstyled',  icon: Icons.bold },
        { label: 'h2', style: 'header-one', type: "block" , icon: Icons.h1 },
        { label: 'h3', style: 'header-two', type: "block",  icon: Icons.h2 },
        { label: 'h4', style: 'header-three', type: "block",  icon: Icons.h3 },

        { type: "separator" },
        { label: 'color', type: "color" },
        { type: "link" },

        { label: 'blockquote', style: 'blockquote', type: "block", icon: Icons.blockquote },
        { type: "separator" },
        { label: 'insertunorderedlist', style: 'unordered-list-item', type: "block", icon: Icons.insertunorderedlist },
        { label: 'insertorderedlist', style: 'ordered-list-item', type: "block", icon: Icons.insertorderedlist },
        { type: "separator" },
        { label: 'pre', style: 'pre', type: "block",  icon: Icons.pre },
        { label: 'bold', style: 'BOLD', type: "inline", icon: Icons.bold },
        { label: 'italic', style: 'ITALIC', type: "inline", icon: Icons.italic }
      ]
    }
  }
  return Object.assign(config, options)
}


