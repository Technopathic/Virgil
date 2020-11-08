/** @jsx jsx  */

import React from 'react'
import { Map } from 'immutable'
import {AnchorPopoverConfig} from './menu/link.js'
import {MenuConfig} from './menu'
import {ImageBlockConfig} from './blocks/image.js'
import {VideoBlockConfig} from './blocks/video.js'
import {CodeBlockConfig} from './blocks/code.js'
import {PlaceholderBlockConfig} from './blocks/placeholder.js'
import Link from './decorators/link'
import Hashtag from './decorators/hashtag'

import Proxima, { P, H1, H2, H3, H4, Divider, Pre, Media, Section, Blockquote, List, ListItem, Column } from 'proxima-ui'
import { jsx, css } from '@emotion/core'

import { 
    convertToRaw,
    convertFromRaw,
    CompositeDecorator,
    getDefaultKeyBinding,
    Editor,
    EditorState,
    Entity,
    RichUtils,
    DefaultDraftBlockRenderMap,
    SelectionState,
    Modifier
} from 'draft-js'

import {
  addNewBlock,
  resetBlockWithType,
  updateDataOfBlock,
  getCurrentBlock,
  addNewBlockAt
} from './model.js'

import findEntities from './utils/find_entities'
import customHTML2Content from './utils/html2content'

import MultiDecorator from 'draft-js-multidecorators'
import createStyles from 'draft-js-custom-styles'

class Virgil extends React.PureComponent {
  constructor(props) {
    super(props)
    
    this.render = this.render.bind(this)
    this.decorator = this.props.decorators(this)

    this.editor = React.createRef()

    this.blockRenderMap = Map({
      "header-one": {
        wrapper: <Section></Section>,
        element: H1,
      },
      "header-two": {
        wrapper: <Section></Section>,
        element: H2
      },
      "header-three": {
        wrapper: <Section></Section>,
        element: H3
      },
      "header-four": {
        wrapper: <Section></Section>,
        element: H4
      },
      "divider": {
        element: Divider
      },
      "image": {
        element: 'figure'
      },
      "video": {
        element: 'figure'
      },
      'unstyled': {
        wrapper: <P></P>,
        element: Section,
      },
      'paragraph': {
        wrapper: <Section></Section>,
        element: P,
        aliasedElements: ['p']
      },
      'placeholder': {
        element: 'div'
      },
      'codeBlock': {
        wrapper: <Section></Section>,
        element: 'code'
      },
      'pre': {
        wrapper: <Section></Section>,
        element: Pre
      },
      'blockquote': {
        wrapper: <Section></Section>,
        element: Blockquote
      },
      'unordered-list-item': {
        wrapper: <List points padding="0px 30px"></List>,
        element: ListItem
      },
      'ordered-list-item': {
        wrapper: <List numbers padding="0px 30px"></List>,
        element: ListItem
      }
    })

    this.extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(this.blockRenderMap)
    this.state = {
      editorState: EditorState.createEmpty(),
      blockRenderMap: this.extendedBlockRenderMap,
      locks: 0,
    };

    this.block_types = this.props.block_types

    const { styles, customStyleFn, exporter } = createStyles(['font-size', 'color', 'font-family'])
    this.styles = styles
    this.customStyleFn = customStyleFn
    this.focus = false
  }

  componentDidMount(){
    this.props.onRef(this)
    this.initializeState()
  }

  componentDidUpdate(prevProps){
    if(prevProps.content && prevProps.content != this.props.content) {
      this.updateState()
    }
  }

  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  initializeState = () => {
    let newEditorState = EditorState.createEmpty(this.decorator)
    if (this.props.content) {
      newEditorState = EditorState.set(
        this.decodeEditorContent(this.props.content), {
          decorator: this.decorator
        })
    }
    this.onChange(newEditorState)
    if(this.props.startFocus) {
      this.editor.current.focus()
    }
  }

  updateState = () =>{
    const newContentState = convertFromRaw(this.props.content )
    let newEditorState = EditorState.push(
      this.state.editorState,
      newContentState,
      'insert-characters'
    )

    newEditorState = EditorState.moveSelectionToEnd(newEditorState)
    this.setState({editorState: newEditorState})
  }

  decodeEditorContent = (raw_as_json) => {
    const new_content = convertFromRaw(raw_as_json)
    return EditorState.createWithContent(new_content, this.decorator)
  }

  refreshSelection = (newEditorState) => {
    const { editorState } = this.state
    const s = editorState.getSelection()
    const focusOffset = s.getFocusOffset()
    const anchorKey = s.getAnchorKey()

    let selectionState = SelectionState.createEmpty(s.getAnchorKey())

    selectionState = selectionState.merge({
      anchorOffset: focusOffset,
      focusKey: anchorKey,
      focusOffset
    })

    let newState = EditorState.forceSelection(newEditorState, selectionState)

    return this.onChange(newState)
  }

  forceRender = (editorState) => {
    const content = editorState.getCurrentContent()
    const newEditorState = EditorState.createWithContent(content, this.decorator)
    return this.refreshSelection(newEditorState)
  }

  onChange = (editorState) => {
    this.setState( { editorState } , () => {

      this.props.onChange ? this.props.onChange(this) : null

      return
    })
  }

  getEditorState = () => this.state.editorState

  getSerializedOutput = () => {
    const raw = convertToRaw(this.state.editorState.getCurrentContent())
    return raw
  }

  getLocks = () => this.state.locks

  addLock = () => {
    let locks = this.state.locks
    return this.setState({
      locks: locks += 1 })
  }

  removeLock = () => {
    let locks = this.state.locks
    return this.setState({
      locks: locks -= 1 })
  }

  renderableBlocks = () => this.props.widgets.filter(o => o.renderable).map(o => o.type)

  defaultWrappers = (blockType) => this.props.default_wrappers.filter(o => o.block === blockType).map(o => o.className)

  blockRenderer = (block) => {

    if (this.renderableBlocks().includes(block.getType())) {
      return this.handleBlockRenderer(block)
    }

    return null
  }

  handleBlockRenderer = (block) => {
    const dataBlock = this.getDataBlock(block)
    if (!dataBlock) {
      return null
    }

    
    return {
      component: dataBlock.block,
      props: {
        data: block.getData(),
        getEditorState: this.getEditorState,
        setEditorState: this.onChange,
        addLock: this.addLock,
        removeLock: this.removeLock,
        getLocks: this.getLocks,
        getEditor: () => { return this },
        config: dataBlock.options
      }
    }
  }

  blockStyleFn = (block) => {
    const currentBlock = getCurrentBlock(this.state.editorState)
    if(!currentBlock) return
    const is_selected = currentBlock.getKey() === block.getKey() ? "is-selected" : ""

    if (this.renderableBlocks().includes(block.getType())) {
      return this.styleForBlock(block, currentBlock, is_selected)
    }

    const defaultBlockClass = this.defaultWrappers(block.getType())
    if (defaultBlockClass.length > 0) {
      return `virgil ${ defaultBlockClass[0] } ${ is_selected }`
    } else {
      return `virgil ${ is_selected }`
    }
  }

  getDataBlock = (block) => {
    
    return this.props.widgets.find(o => {
      return o.type === block.getType()
    })
  }

  styleForBlock = (block, currentBlock, is_selected) => {
    const dataBlock = this.getDataBlock(block)

    if (!dataBlock) {
      return null
    }

    const selectedFn = dataBlock.selectedFn ? dataBlock.selectedFn(block) : ''
    const selected_class = (dataBlock.selected_class ? dataBlock.selected_class : '' )
    const selected_class_out = is_selected ? selected_class : ''

    return `${ dataBlock.wrapper_class } ${ selected_class_out } ${ selectedFn }`
  }

  handlePasteText = (text, html) => {

    if (!html) {
      return this.handleTXTPaste(text, html)
    }
    if (html) {
      return this.handleHTMLPaste(text, html)
    }
  }

  handleTXTPaste = (text, html) => {
    const currentBlock = getCurrentBlock(this.state.editorState)

    let { editorState } = this.state

    switch (currentBlock.getType()) {
      case "image":case "video":case "placeholder":
        const newContent = Modifier.replaceText(editorState.getCurrentContent(), new SelectionState({
          anchorKey: currentBlock.getKey(),
          anchorOffset: 0,
          focusKey: currentBlock.getKey(),
          focusOffset: 2
        }), text)

        editorState = EditorState.push(editorState, newContent, 'replace-text')

        this.onChange(editorState)

        return true
      default:
        return false
    }
  }

  handleHTMLPaste = (text, html) => {

    const currentBlock = getCurrentBlock(this.state.editorState)

    let { editorState } = this.state

    switch (currentBlock.getType()) {
      case "image":case "video":case "placeholder":
        return this.handleTXTPaste(text, html)
    }

    const newContentState = customHTML2Content(html, this.extendedBlockRenderMap)
    
    const pastedBlocks = newContentState.getBlockMap()

    const newState = Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      pastedBlocks
    );

    const pushedContentState = EditorState.push(editorState, newState, 'insert-fragment')

    this.onChange(pushedContentState)

    return true
  }

  handlePasteImage = (files) => {
    return files.map(file => {
      let opts = {
        url: URL.createObjectURL(file),
        file
      }

      return this.onChange(addNewBlock(this.state.editorState, 'image', opts))
    })
  }

  handleDroppedFiles = (state, files) => {
    return files.map(file => {
      let opts = {
        url: URL.createObjectURL(file),
        file
      }

      return this.onChange(addNewBlock(this.state.editorState, 'image', opts))
    })
  }

  handleReturn = (e) => {
    if (this.props.handleReturn) {
      if (this.props.handleReturn()) {
        return true
      }
    }

    let { editorState } = this.state

    if (e.shiftKey) {
      this.setState({ editorState: RichUtils.insertSoftNewline(editorState) });
      return true;
    }

    if (!e.altKey && !e.metaKey && !e.ctrlKey) {
      const currentBlock = getCurrentBlock(editorState)
      const blockType = currentBlock.getType()
      const selection = editorState.getSelection()

      const config_block = this.getDataBlock(currentBlock)

      if (currentBlock.getText().length === 0) {

        if (config_block && config_block.handleEnterWithoutText) {
          config_block.handleEnterWithoutText(this, currentBlock)
          return true
        }

        if (this.props.continuousBlocks.indexOf(blockType) < 0) {
          this.onChange(addNewBlockAt(editorState, currentBlock.getKey()))
          return true
        }

        switch (blockType) {
          case "header-one":
            this.onChange(resetBlockWithType(editorState, "unstyled"))
            return true
            break
          default:
            return false
        }
      }

      if (currentBlock.getText().length > 0) {

        if (config_block && config_block.handleEnterWithText) {
          config_block.handleEnterWithText(this, currentBlock)
          return true
        }

        if (currentBlock.getLength() === selection.getStartOffset()) {
          if (this.props.continuousBlocks.indexOf(blockType) < 0) {
            this.onChange(addNewBlockAt(editorState, currentBlock.getKey()))
            return true
          }
        }

        return false
      }

      // selection.isCollapsed() and # should we check collapsed here?
      if (currentBlock.getLength() === selection.getStartOffset()) {
        //or (config_block && config_block.breakOnContinuous))
        // it will match the unstyled for custom blocks
        if (this.props.continuousBlocks.indexOf(blockType) < 0) {
          this.onChange(addNewBlockAt(editorState, currentBlock.getKey()))
          return true
        }
        return false
      }

      return false
    }
  }

  handleBeforeInput = (chars) => {
    const currentBlock = getCurrentBlock(this.state.editorState)

    if(!currentBlock) return

    const blockType = currentBlock.getType()
    const selection = this.state.editorState.getSelection()

    let { editorState } = this.state

    const endOffset = selection.getEndOffset()
    const endKey = currentBlock.getEntityAt(endOffset - 1)
    const endEntityType = endKey && Entity.get(endKey).getType()
    const afterEndKey = currentBlock.getEntityAt(endOffset)
    const afterEndEntityType = afterEndKey && Entity.get(afterEndKey).getType()

    if(blockType === 'image' && chars !== "") {
      resetBlockWithType(this.state.editorState)
      return true
    }

    if (chars === ' ' && endEntityType === 'LINK' && afterEndEntityType !== 'LINK') {
      const newContentState = Modifier.insertText(editorState.getCurrentContent(), selection, ' ')
      const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters')
      this.onChange(newEditorState)
      return true
    }

    if (blockType.indexOf('atomic') === 0) {
      return false
    }

    if(chars !== " ") {
      const blockLength = currentBlock.getLength()
      if (selection.getAnchorOffset() > 1 || blockLength > 1) {
        return false    
      }
    }

    const blockTo = this.props.character_convert_mapping[currentBlock.getText() + chars]

    if (!blockTo) {
      return false
    }
    this.onChange(resetBlockWithType(editorState, blockTo))

    return true
  }

  handleKeyCommand = (command) => {
    const { editorState } = this.state
    let newBlockType

    if (this.props.handleKeyCommand && this.props.handleKeyCommand(command)) {
      return true
    }

    if (command === 'add-new-block') {
      this.onChange(addNewBlock(editorState, 'blockquote'))
      return true
    }

    if (command.indexOf('toggle_inline:') === 0) {
      newBlockType = command.split(':')[1]
      this.onChange(RichUtils.toggleInlineStyle(editorState, newBlockType))
      return true
    }

    if (command.indexOf('toggle_block:') === 0) {
      newBlockType = command.split(':')[1]
      this.onChange(RichUtils.toggleBlockType(editorState, newBlockType))
      return true
    }

    const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }

    return false
  }

  findCommandKey = (opt, command) => {
    return this.props.key_commands[opt].find(o => o.key === command)
  }

  KeyBindingFn = (e) => {

    let cmd
    if (e.altKey) {
      if (e.shiftKey) {
        cmd = this.findCommandKey("alt-shift", e.which)
        if (cmd) {
          return cmd.cmd
        }

        return getDefaultKeyBinding(e)
      }

      if (e.ctrlKey || e.metaKey) {
        cmd = this.findCommandKey("alt-cmd", e.which)
        if (cmd) {
          return cmd.cmd
        }
        return getDefaultKeyBinding(e)
      }
    } else if (e.ctrlKey || e.metaKey) {
      cmd = this.findCommandKey("cmd", e.which)
      if (cmd) {
        return cmd.cmd
      }
      return getDefaultKeyBinding(e)

    }

    if (e.key === 'Backspace') {
      const currentBlock = getCurrentBlock(this.state.editorState)

      if(!currentBlock) { return }
  
      const blockType = currentBlock.getType()
      if(blockType === 'video') {
        e.preventDefault()
        return this.forceRender(resetBlockWithType(this.state.editorState))
      }

      if(blockType === 'codeBlock') {
        e.preventDefault()
        return this.forceRender(resetBlockWithType(this.state.editorState))
      }
    }

    return getDefaultKeyBinding(e)
  }

  updateBlockData = (block, options) => {
    const data = block.getData()
    const newData = data.merge(options)
    const newState = updateDataOfBlock(this.state.editorState, block, newData)
    return this.forceRender(newState)
  }

  handleShowPopLinkOver = (e) => this.showPopLinkOver()

  handleHidePopLinkOver = (e) => this.hidePopLinkOver()

  showPopLinkOver = (el) => {
    if(!this.refs.anchor_popover) { return }

    let coords
    this.refs.anchor_popover.setState({ url: el ? el.href : this.refs.anchor_popover.state.url })


    if (coords) {
      this.refs.anchor_popover.setPosition(coords)
    }

    this.refs.anchor_popover.setState({ show: true })

    this.isHover = true
    return this.cancelHide()
  }

  hidePopLinkOver = () => {
    if(!this.refs.anchor_popover)
      return
    
    return this.hideTimeout = setTimeout(() => {
      return this.refs.anchor_popover.hide()
    }, 300)
  }

  cancelHide = () => {
    return clearTimeout(this.hideTimeout)
  }

  onBlur = () => this.focus = false

  onFocus = () => this.focus = true

  focusEditor = () => {
    setTimeout(() => {
      this.editor.current.focus();
    });
  };

  renderBodyPlaceholder = () => {
      if(this.getSerializedOutput().blocks[0].type === "unstyled" && !this.props.readOnly) {
        return (
          <Section position="absolute" top="0" left="0" right="0" zIndex="-1" color="#AAAAAA">
            {this.props.bodyPlaceholder}
          </Section>
        )
      } else {
        return ("");
      }
  }

  render(){
    return(
      <Proxima theme={this.props.theme ? this.props.theme : {}}>
        <Column position="relative" height="100%" style={this.props.style}>
          <Section 
            ref={this.editorWrapper} 
            position="relative" 
            height="100%" 
            zIndex="1" 
            css={css` figure { margin:0; padding:0; } > div { height: 100%; cursor: text; overflow:auto }`}
            onClick={this.focusEditor}
          >
            <Editor
              blockRendererFn={ this.blockRenderer }
              editorState={ this.state.editorState }
              onBlur={this.onBlur}
              onFocus={this.onFocus}
              onChange={ this.onChange }
              handleReturn={ this.handleReturn }
              blockStyleFn={ this.blockStyleFn }
              customStyleFn={this.customStyleFn }
              blockRenderMap={ this.state.blockRenderMap }
              handlePastedText={ this.handlePasteText }
              handlePastedFiles={ this.handlePasteImage }
              handleDroppedFiles={ this.handleDroppedFiles }
              handleKeyCommand={ this.handleKeyCommand }
              keyBindingFn={ this.KeyBindingFn }
              handleBeforeInput={ this.handleBeforeInput }
              placeholder={ this.renderBodyPlaceholder() }
              readOnly={this.props.readOnly}
              mediaWrapper={this.props.mediaWrapper}
              ref={this.editor}
            />
          </Section>
          <Divider color="#CCCCCC" />
          <Section>
            {
              !this.props.readOnly ? 
                this.props.tooltips.map( (o, i) => {
                  return (
                    <o.component
                      key={ i }
                      editor={ this }
                      editorState={ this.state.editorState }
                      onChange={ this.onChange }
                      style={this.styles}
                      configTooltip={ o }
                      widget_options={ o.widget_options }
                      showPopLinkOver={ this.showPopLinkOver }
                      hidePopLinkOver={ this.hidePopLinkOver }
                      handleOnMouseOver={ this.handleShowPopLinkOver }
                      handleOnMouseOut={ this.handleHidePopLinkOver }
                    />
                  )
                })
              : null
            }
          </Section>
        </Column>
      </Proxima>
    )
  }
}

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

const HASHTAG_REGEX = /\B(\#[a-zA-Z0-9]+\b)(?!;)/g;
const hashtagStrategy = (contentBlock, callback, contentState) => {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

Virgil.defaultProps = {
  content: null,
  spellcheck: false,
  title_placeholder: "Title",
  bodyPlaceholder: "Write your story",

  decorators: (context) => {
    return new MultiDecorator([
      new CompositeDecorator(
        [{
          strategy: findEntities.bind(null, 'LINK', context),
          component: Link
        },
        {
          strategy:hashtagStrategy,
          component: Hashtag
        }]
      )
    ])
  },

  default_wrappers: [
    { block: 'unstyled' },
    { block: 'header-one' },
    { block: 'header-two' },
    { block: 'header-three' },
    { block: 'blockquote' },
    { block: 'unordered-list-item' },
    { block: 'ordered-list-item' },
    { block: 'codeBlock' },
    { block: 'BOLD' },
    { block: 'ITALIC' },
    { block: 'divider' }
  ],

  continuousBlocks: [
    "unstyled",
    "blockquote",
    "ordered-list",
    "unordered-list",
    "unordered-list-item",
    "ordered-list-item"
  ],

  key_commands: {
      "alt-shift": [{ key: 65, cmd: 'add-new-block' }],
      "alt-cmd": [{ key: 49, cmd: 'toggle_block:header-one' },
                  { key: 50, cmd: 'toggle_block:header-two' },
                  { key: 53, cmd: 'toggle_block:blockquote' }],
      "cmd": [{ key: 66, cmd: 'toggle_inline:BOLD' },
              { key: 73, cmd: 'toggle_inline:ITALIC' },
              { key: 75, cmd: 'insert:link' },
              { key: 13, cmd: 'toggle_block:divider' }
      ]
  },

  character_convert_mapping: {
    '> ': "blockquote",
    '*.': "unordered-list-item",
    '* ': "unordered-list-item",
    '- ': "unordered-list-item",
    '1.': "ordered-list-item",
    '# ': 'header-one',
    '## ': 'header-two',
    '### ': 'header-three',
    '==': "unstyled",
    '` ': "pre"
  },

  tooltips: [
    AnchorPopoverConfig(),
    MenuConfig(),
  ],
  
  widgets: [
    ImageBlockConfig(),
    VideoBlockConfig(),
    PlaceholderBlockConfig(),
    CodeBlockConfig()
  ]

}


export default Virgil
