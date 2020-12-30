A project for controlling Tesoro GRAM SE Spectrum with node.js

## API

### `TesoroGramSE`

```js
import HID from 'node-hid';
import { TesoroGramSE, ProfileSelect, ProfileState } from 'node-tesoro';

const keyboard = new TesoroGramSE(new HID.HID(HID.devices().filter(x => x.path && x.productId == 0x2057 && x.interface == 1 && x.path.includes("col05"))[0].path!));
```

### `keyboard.changeProfile(profile_num)`

- `profile_num` - ProfileSelect - profile number to change to

### `keyboard.setProfileSettings(data)`

- `data` - ProfileState - updates the current profile's state

### `keyboard.setKeyColor(key, r, g, b)`

- `key` - string
- `r,g,b` - number
-----

## General notes

### Key dictionary

- The current key dictionary contains a Hungarian, 105 keys layout
- It can be updated to accept more character for an index, please create a pull request if you want to update (*although I don't know how to use the indexes then*)
- You can use the private function `initKeys` to get your keyboard's key indexes