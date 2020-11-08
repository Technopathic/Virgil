<p align="center">
  <img width="800" height="250" src="https://storage.googleapis.com/virgil-f3dca.appspot.com/githubVirgil.png">
</p>

# Virgil - WYSIWYG Editor 

[Documentation and Demo](https://technopathic.github.io/Virgil/)

Virgil is an online editor designed to give your content creation a more seamless flow. Focusing more on a distraction-free environment, Virgil aims to give you all of the features of a WYSIWYG editor in a minimalist package. We have extended DraftJS to support images and video content, as well as URL insertion, markdown, serialized output, and much more. Similarly to the Roman Poet, Virgil, we sought to make it easier for authors to create meaning in their works.


## Installation
You can install Virgil into your React or NextJS project by doing the following:
```
npm install virgil --save
```

```
yarn add virgil
```


## Usage
If your building a ReactJS project, importing the component in the traditional way or asynchronous is fine. For example:

```
import Virgil from 'virgil'
```

If you're building a NextJS project, then you will have to import Virgil asynchronous with SSR disabled
```
import dynamic from 'next/dynamic'
const Virgil = dynamic(() => import('./components/editor'), { ssr: false })
```

## Render
You can render the Virgil editor using the code below. With Virgil, you need to set an editor object as a ref. Although it's not required, you can also set a content prop, if you are loading in contentBlock data. We also recommend setting the startFocus prop to true as well, which will set the editor to focus as soon as it loads into view.

```
import React, { useState } from 'react'
import Virgil from 'virgil'

const App = () => {
  const [ initial ] = useState({"blocks":[],"entityMap":{}})
  const [ editor, setEditor ] = useState({})

  return (
    <Virgil content={initial} onRef={ref => setEditor(ref)} startFocus={true} />
  )
}
```

To set your initial data into Virgil Editor, you can add a Serialized Content Object to the Virgil content prop.

## Retrieve Data
To retrieve data from Virgil, you can make use of the Editor's built-in functions and its ref variable.

```
editor.getSerializedOutput() // Outputs blocks array and entity map 
```

## Uploading Images
Virgil allows you to asynchronously upload images as you add them to your content. In order to use this feature, you must pass an image upload function to Virgil using the "imageUpload" prop. Your image upload function should have a callback that returns the url of your newly uploaded image.

Virgil outputs an object to be passed to your function as a parameter. The object contains a key of "image" and a value of your base64 encoded image.

Here is an example of an upload function using Firebase and its implementation with Virgil.

```
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
```

## Markdown
Virgil has support for some basic Markdown features (which are live-rendered in the editor). See the documentation for more details.

## Technologies
* ReactJS
* DraftJS
* Proxima-UI

## License
MIT