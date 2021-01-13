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

const keyboard = new TesoroGramSE(new HID.HID(HID.devices()
                  .filter(x => x.path && x.productId == 0x2057 && x.interface == 1 && x.path.includes("col05"))[0].path!), 
                  'hungarian');
```

- `keyboard` - HID - the HID interface of the keyboard
- `layout` - string - a string which is in the layouts: it provides the key indexes for the spectrum, and a keyboard layout for future usage
  - Possible values:
    - hungarian
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

## General notes

### Key dictionary

- The current key dictionary contains a Hungarian, 105 keys layout
- It can be updated to accept more character for an index, please create a pull request if you want to update (*although I don't know how to use the indexes then*)
- You can use the private function `initKeys` to get your keyboard's key indexes

### GUI

- In an other project, I will create a GUI, that uses this API
- (because in my opinion, the software that came with the keyboard is kind of poopoo)

## Issues

- If a profile's settings or a spectrum gets updated, the Windows key will be locked (the official software's behaviour is the same)
