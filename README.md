A project for controlling Tesoro GRAM SE Spectrum with node.js

## API

### `TesoroGramSE`

```js
import HID from 'node-hid';
import { TesoroGramSE } from from 'node-tesoro';

const keyboard = new TesoroGramSE(new HID.HID(HID.devices().filter(x => x.path && x.productId == 0x2057 && x.interface == 1 && x.path.includes("col05"))[0].path!));
```

### `keyboard.changeProfile(ProfileSelect p)`