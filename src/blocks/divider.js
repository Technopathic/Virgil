import { divider } from "../icons";

const Divider = (props) => {
  return <span></span>
}

export default Divider

export const DividerBlockConfig = ( options = {} ) => {
  let config =  {
    title: 'add divider',
    type: 'divider',
    icon: divider,
    block: Divider,
    editable: false,
    renderable: true,
    breakOnContinuous: false,
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: "insertion",
      insert_block: "divider"
    }
  };
  
  return Object.assign(config, options)
}