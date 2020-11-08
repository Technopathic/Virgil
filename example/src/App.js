import React, { useState } from 'react'

import Proxima, { H1, H2, Bold, Main, Section, Column, Divider, P, Pre, Table, A, Button } from 'proxima-ui'
import Virgil from 'virgil'

import Code from './components/Code'

import global from './global'

const theme = {
  headingOne: {
    color:"#29264c"
  },
  headingTwo: {
    color:"#29264c"
  },
  p: {
    color:"#29264c"
  },
  divider: {
    color:"#29264c"
  },
  span: {
    color:"#29264c"  
  },
  a: {
    color:"#29264c",
    fontSize: "16px"  
  },
  media: {
    iframeWidth:"500px",
    iframeHeight: "300px"
  }
}

const App = () => {
  const [ initialData ] = useState({"blocks":[],"entityMap":{}})
  const [ editor, setEditor ] = useState({})

  return (
    <Proxima global={global} theme={theme}>
      <Main background="linear-gradient(45deg, rgba(144,162,252,1) 0%, rgba(253,131,156,1) 100%)"
       minHeight="100vh" justifyContent="space-around" alignItems="center" padding="16px">
        <Column width="100%" alignItems="center" justifyContent="center" margin="16px 0px 0px 0px">
          <H1 fontFamily="Brightons" fontSize="8em" margin="68px 0px" textAlign="center">Virgil</H1>
          <H2 textAlign="center">A WYSIWYG Editor built with DraftJS</H2>
        </Column>
         <Section 
          background="#FFFFFF" 
          width="100%" 
          maxWidth="768px" 
          height="350px" 
          radius="8px" 
          boxShadow="0 0 15px 0px rgba(0, 0, 0, 0.4)"
          padding="15px"
          margin="48px 0px 32px 0px"
        >
          <Virgil content={initialData} onRef={ref => setEditor(ref)} theme={theme} startFocus={true} />
        </Section>
        <Section maxWidth="768px">
          <P lineHeight="1.9" margin="16px 0px">
            Virgil is an online editor designed to give your content creation a more seamless flow. Focusing more on a distraction-free environment, Virgil aims to give you all of the features of a WYSIWYG editor in a minimalist package. We have extended DraftJS to support images and video content, as well as URL insertion, markdown, serialized output, and much more. Similarly to the Roman Poet, Virgil, we sought to make it easier for authors to create meaning in their works.
          </P>
          <A href="http://github.com/Technopathic/Virgil" target="_blank">
            <Button background="rgb(46,52,64)" color="rgb(216,222,233)" hoverColor="#FFFFFF" maxWidth="140px">Github</Button>
          </A>
          <Column margin="16px 0px">
            <H2>Installation</H2>
            <Divider />
            <Pre background="rgb(46, 52, 64)" color="rgb(216, 222, 233)">npm install virgil --save</Pre>
            <Pre background="rgb(46, 52, 64)" color="rgb(216, 222, 233)">yarn add virgil</Pre>
          </Column>

          <Column margin="16px 0px">
            <H2>Usage</H2>
            <Divider />
            <P lineHeight="1.9">
              If your building a ReactJS project, importing the component in the traditional way or asynchronous is fine. For example:
            </P>
            <Code data={`
import Virgil from 'virgil'
            `}/>
            <P>
              If you're building a NextJS project, then you will have to import Virgil asynchronous with SSR disabled
            </P>
            <Code data={`
import dynamic from 'next/dynamic'
const Virgil = dynamic(() => import('./components/editor'), { ssr: false })
            `}/>
            <P>* Your directories may vary.</P>
          </Column>

          <Column margin="16px 0px">
            <H2>Render</H2>
            <Divider />
            <P>You can render the Virgil editor using the code below. With Virgil, you need to set an editor object as a ref. Although it's not required, you can also set a content prop, if you are loading in contentBlock data. We also recommend setting the startFocus prop to true as well, which will set the editor to focus as soon as it loads into view.</P>
            <Code data={`
import React, { useState } from 'react'
import Virgil from 'virgil'

const App = () => {
  const [ initial ] = useState({"blocks":[],"entityMap":{}})
  const [ editor, setEditor ] = useState({})

  return (
    <Virgil content={initial} onRef={ref => setEditor(ref)} startFocus={true} />
  )
}
            `}/>
            <P>
              To set your initial data into Virgil Editor, you can add a Serialized Content Object to the Virgil content prop.
            </P>
          </Column>

          <Column margin="16px 0px">
            <H2>Retrieve Data</H2>
            <Divider />
            <P margin="0px 0px 32px 0px">To retrieve data from Virgil, you can make use of the Editor's built-in functions and its ref variable</P>
            <Bold>Serialized Output</Bold>
            <Code data={`
editor.getSerializedOutput() // Outputs blocks array and entity map           
            `}
            />
          </Column>

          <Column margin="16px 0px">
            <H2>Uploading Images</H2>
            <Divider />
            <P margin="0px 0px 32px 0px">Virgil allows you to asynchronously upload images as you add them to your content. In order to use this feature, you must pass an image upload function to Virgil using the "imageUpload" prop. Your image upload function should have a callback that returns the url of your newly uploaded image.</P>

            <P>Virgil outputs an object to be passed to your function as a parameter. The object contains a key of "image" and a value of your base64 encoded image.</P>
            <P>Here is an example of an upload function using Firebase and its implementation with Virgil.</P>
            <Code data={`
const uploadToServer = async(imageData) => {
  await axios({
    method: 'POST',
    url: https://Your-upload-url?token=idTokens,
    headers: { 'Content-Type': 'application/json' }
    data: imageData
  })
  .then(response => response.data)
  .then(json => {
    return json.url
  })  
  .catch(error => {
    console.log(error)
  })
}

return (
  <Virgil onRef={ref => setEditor(ref)} imageUpload={uploadToServer} />
)

            `}
            />
          </Column>

          <Column margin="16px 0px">
            <H2>Markdown</H2>
            <Divider />
            <P margin="0px 0px 16px 0px">Virgil has support for some basic Markdown features (which are live-rendered in the editor).</P>
            <Table cellWidth="20%" border="1px solid #29264c" color="#29264c" padding="10px" data={{
              "head": [
                {"row": ["Key", "Result"]}
              ],
              "body": [
                  { "row": ["> ", "blockquote" ]},
                  { "row": ["* ", "unordered-list-item" ]},
                  { "row": ["1.", "ordered-list-item" ]},
                  { "row": ["# ", "heading-one" ]},
                  { "row": ["##", "heading-two" ]},
                  { "row": ["###", "heading-three" ]},
                  { "row": ["==", "unstyled" ]},
                  { "row": ["` ", "pre" ]},
              ]
            }} />
          </Column>
          <Column margin="32px 0px" alignItems="center">
            <P fontSize="16px" textAlign="center">Made with ❤ in Helsinki. Created by&nbsp;<A href="https://twitter.com/NowNanoTV" target="_blank" color="#29264c">Technopathic</A></P>
          </Column>
        </Section>
      </Main>
    </Proxima>
  )
}

export default App
