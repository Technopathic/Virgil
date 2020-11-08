import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'

import { nord, githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs'

const Code = (props) => {

    return (
        <SyntaxHighlighter
            customStyle={{fontSize: '16px', padding: "0px 20px"}}
            style={props.light ? githubGist : nord}
            language={props.language || "auto"} 
            showLineNumbers={
                props.showLineNumbers ? props.showLineNumbers :
                process.env.SHOW_LINE_NUMBERS 
            }>
            {props.data}
        </SyntaxHighlighter>
    )
}

export default Code