# svg2rn
<p align="center">
Convert svg files to React class for use this files in your ReactNative project
</p>

## Installation
```
npm install -g svg2rn
```

If you find bag, please create ISSUE.

## Usage

:exclamation: **IMPORTANT** :exclamation: In project your need install [```react-native-svg```](https://github.com/react-native-community/react-native-svg) package for support svg component :exclamation: 


To run the script go to the folder with you svg files and run command in console
```
svg2rn
```

After, will be created folder Component, where exist JS file.

If you have choice output folder, please select your folder write argument -o, --output and name you path.
```
svg2rn -o /home/user/icon
```

Folder Component will not be created auto.

## Example

Svg file before convert

```xml
<svg xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="23" viewBox="0 0 25 23">
    <defs>
        <path id="5ilna" d="M129.7 160.66l4.2 6 7.03 2.16-4.42 5.83.13 7.33-6.94-2.37-6.92 2.37.13-7.33-4.41-5.83 7-2.17z"/>
    </defs>
    <g>
        <g transform="translate(-117 -160)">
            <use fill="#fff" fill-opacity="0" stroke="#a2b2bc" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="50" xlink:href="#5ilna"/>
        </g>
    </g>
</svg>
```

Svg component after convert

```jsx
import React from "react";
import Svg, { Use } from "react-native-svg";

const StarIcon = props => (
  <Svg width={25} height={23} viewBox="0 0 25 23" {...props}>
    <Use
      fill="#fff"
      fillOpacity={0}
      stroke="#a2b2bc"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={50}
      xlinkHref="#a"
      transform="translate(-117 -160)"
    />
  </Svg>
);

export default StarIcon;
```

Usage

```jsx
import StarIcon from 'StarIcon'

// We resize image to width=50 and height=46
// Attrs fill,width,height and other don't required

<StarIcon fill='#fff' width={50} height={46}>

//
```

## Licence MIT.