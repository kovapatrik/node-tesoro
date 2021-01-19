## Installation

It's a standard npm package, so you can install it with this command, if you are using npm:
```
npm install node-tesoro
```
or if you are using yarn:
```
yarn add node-tesoro
```

## API

### `TesoroGramSE(keyboard, layout, profile_state)`

```js
import HID from 'node-hid';
import { TesoroGramSE, Profile, Spectrum, ProfileState } from 'node-tesoro';

function handleChange(data:any) {
  console.log(data);
}

const keyboard = new TesoroGramSE('hungarian', handleChange);
```

- `layout` - string - a string which is in the layouts: it provides the key indexes for the spectrum, and a keyboard layout for future usage
  - Possible values:
    - hungarian
- `callback` - function|optional - a callback function which called after a keyboard event happened (e.g.: switching profile or brightness on the keyboard)
  - the function must have 1 parameter
  - the data format is JSON, like {'brightness', 1}
- `profile_state` - ProfileState|optional - the init profile state, it has a default, but you can override it

### `keyboard.changeProfile(profile_num)`

- `profile_num` - ProfileSelect - profile number to change to

### `keyboard.setProfileSettings(data)`

- `data` - ProfileState - updates the current profile's state

### `keyboard.setKeyColor(key, r, g, b, e)`

- `key` - string - key name from the dictionary
- `r,g,b` - number - color for the key
- `e` - SpectrumEffect - in case the user wants to change the effect

### `keyboard.sendSpectrumSettings()`
- sends the current spectrum state to the keyboard
  
### `keyboard.sendProfileSettings()`
- sends the current profile state to the keyboard
-----

## GUI

- I created a GUI for this API in React, you can check it [here](https://github.com/kovapatrik/node-tesoro-gui)

## General notes

### Compatibility
- Because it communicates with a HID device it cannot be used directly in a browser-based project
- It has to be exposed as an API from a server

### Key dictionary

- The current key dictionary contains a Hungarian, 105 keys layout
- It can be updated to accept more layouts, please create a pull request if you want to update.
- You can use the private function `initKeys` to get your keyboard's key indexes

## Issues

- If a profile's settings or a spectrum gets updated, the Windows key will be locked (the official software's behaviour is the same)
