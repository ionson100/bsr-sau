# bsr-sau

> React: Simple Avatar Uploader

[![NPM](https://img.shields.io/npm/v/bsr-sau.svg)](https://www.npmjs.com/package/bsr-sau) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save bsr-sau
```

## Usage

```tsx
import React, { Component } from 'react'
import AvatarUploader from 'bsr-sau'
import 'bsr-sau/dist/index.css'

<AvatarUploader
canvasSize=200
url='/ContentApi/AvatarUpload'
done={(data)=>{
    alert( "done: server response: "+data)
}}/>

```

## License

MIT © [ionson100](https://github.com/ionson100)

[Props, Function](https://ionson100.github.io/wwwroot/index.html#mode=bsrsau&page=bsrsau&state=true).

[Examples, Help pages](https://ionson100.github.io/wwwroot/index.html#mode=bsrsau&page=3-5).
