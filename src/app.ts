import USB from "usb";
import * as spectrum from "./spectrum";
import * as utils from "./utils";
import * as profile from "./profile"

class TesoroGramSE {
    keyboard: USB.Device;
    profile_num: profile.ProfileSelect;

    constructor(keyboard : USB.Device) {
        this.keyboard = keyboard;
        this.profile_num = profile.ProfileSelect.NONE;
    }

    async changeProfile(profile_num: profile.ProfileSelect) {
        if (profile_num == profile.ProfileSelect.NONE) {
            console.error("You can't change the profile to NONE"!);
        } else {
            let packet = profile.PACKET_CHANGE_PROFILE.map((item) => {return item == -1 ? profile_num : item;});
            this.profile_num = profile_num;
            await this.sendCommand(utils.numArrayToHexString(packet), 'setProfile');
        }
    }

    async setProfileSettings() {
        if (this.profile_num == profile.ProfileSelect.NONE) {
            console.error('Set a profile first!');
        } else {
            let init_packet = profile.PACKET_INIT_CHANGE_PROFILE_SETTINGS.map((item) => {return item == -1 ? this.profile_num : item;});
        }

    }

    async setKeyColor(key : string, r: number, g: number, b: number) {
        let packet = spectrum.SPECTRUM_PACKET;
        if (!(key in spectrum.KEYS)) {
            console.error('Key is not properly set.')
        } else {
            await this.sendCommand(utils.numArrayToHexString(packet), 'setKeyColor');
        }
    }

    private sendCommand(data : string, type: string) : Promise<number> {
        return new Promise((res, rej) => {
            this.keyboard.open();
            this.keyboard.controlTransfer(0x21, 0x09, 0x0307, 1, Buffer.from(data, 'hex'), (e) => {
                if (e) {
                    console.log('Error at', type);
                    console.error(e);
                }
                this.keyboard.close();
                res(1);
            });
        })
    }
}

let tesoro = new TesoroGramSE(USB.getDeviceList().filter(x => x.deviceDescriptor.idProduct == 0x2057)[0]);
tesoro.changeProfile(profile.ProfileSelect.Profile2);