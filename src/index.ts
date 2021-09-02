import HID from "node-hid";
import * as spectrum from "./spectrum";
import * as utils from "./utils";
import * as profile from "./profile"
import * as packets from "./packets"
import inquirer from 'inquirer';
import { Layouts, Layout } from "./layouts/layouts";

const layouts = new Layouts;

interface ProfileState {
    _id?: profile.ProfileSelect
    r: number
    g: number
    b: number
    effect: profile.Effect
    brightness: profile.Brightness
    effect_color: profile.EffectColor
};

interface SpectrumState {
    _id?: string;
    effect: spectrum.Effect;
    keys: Layout['key_index'];
}

class TesoroGramSE {
    keyboard?: HID.HID;
    keys: Layout['key_index'];
    layout_str: Layout['gui'];
    profile_id: profile.ProfileSelect;
    development: boolean;
    constructor({layout, callback, profile_id = profile.ProfileSelect.Profile1, development = false}: {layout: string, callback?: Function, profile_id: profile.ProfileSelect, development: boolean}) {
        const devices = HID.devices();
        this.development = development;
        this.keyboard = this.development ? undefined : new HID.HID(devices.filter(x => x.path && x.productId == 0x2057 && x.interface == 1 && x.path.includes("col05"))[0].path!);
        this.keys = layouts.get(layout).key_index,
        this.layout_str = layouts.get(layout).gui;
        this.profile_id = profile_id;
        if (callback) {
            const listener = new HID.HID(devices.filter(x => x.path && x.productId == 0x2057 && x.interface == 2)[0].path!);
            listener.on('data', (data) => {
                callback(utils.inputBufferToData(data));
            });
        }
    }

    async changeProfile(_id: profile.ProfileSelect) {
        if (_id === undefined) {
            console.error("You can't change the profile to none!");
        } else {
            let packet = packets.PACKET_CHANGE_PROFILE.map((item) => {return item == 'profile' ? _id : item;});
            this.profile_id = _id;
            await this.sendCommand(utils.packetToByteArray(packet), 'setProfile');
        }
    }

    async sendProfileSettings(profileState : ProfileState) {

        if (profileState._id !== this.profile_id) {
            await this.changeProfile(profileState._id!);
        }
        let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? profileState._id : item;});
            await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
            if (profileState._id !== profile.ProfileSelect.PC) {
                let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? profileState._id : item;});
                await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
            }
            let settings_packet = packets.PACKET_PROFILE_SETTINGS;
            for(const d of Object.entries(profileState)) {
                const param = d[0];
                const value = d[1];
                settings_packet = settings_packet.map((item) => {return item == param ? value : item;});
            }
            await this.sendCommand(utils.packetToByteArray(settings_packet), 'settingsPacket', 280);
    }

    async sendSpectrumSettings(spectrumState : SpectrumState) {

        let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_id : item;});
        await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
        if (this.profile_id !== profile.ProfileSelect.PC) {
            let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_id : item;});
            await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
        }
        let endPacket = packets.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_id : item == 'effect' ? spectrumState.effect : item;});

        let packet1 = packets.PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_id : item;});
        let packet2 = packets.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_id : item;});
        for (const k of Object.values(spectrumState.keys)) {
            packet1[k.index] = k.r;
            packet1[k.index + 128] = k.g;
            packet2[k.index] = k.b;
        }
        await this.sendCommand(utils.packetToByteArray(packet1), 'spectrum1Packet', 150);
        await this.sendCommand(utils.packetToByteArray(packet2), 'spectrum2Packet'); 
        await this.sendCommand(utils.packetToByteArray(endPacket), 'spectrumEndPacket', 280);
    }

    private sendCommand(data : number[], type: string, to: number = 10) : Promise<number> {
        return new Promise((res, rej) => {
            try {
                if (this.development) {
                    throw 'You cannot send commands to the keyboard in development mode!'
                }
                setTimeout(() => {
                    this.keyboard!.sendFeatureReport(data);
                    res(1);
                }, to)
            } catch(e) {
                console.error('Error at', type);
                rej(0);
            }
        })
    }

    private async initKeys() {
        const q = [{
            name: "key",
            message: "Which key?"
        }];

        let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_id : item;});
        let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_id : item;});
        let endPacket = packets.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_id : item;});

        
        let packet2 = packets.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_id : item;});
        let keys  :{ [key: string]: number } ={}
        const getKey = async (i: number) => {
            let packet1 = packets.PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_id : item;});
            packet1[i] = 255;
            await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
            await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
            await this.sendCommand(utils.packetToByteArray(packet1), 'spectrum1Packet', 150);
            await this.sendCommand(utils.packetToByteArray(packet2), 'spectrum2Packet'); 
            await this.sendCommand(utils.packetToByteArray(endPacket), 'spectrumEndPacket', 280);
            inquirer.prompt(q).then((ans) => {
                if (ans['key']) {
                    keys[ans['key']] = i;
                }
                i++;
                if (i < 136) {
                    getKey(i);
                }
            });
            console.log(keys);
        }
        getKey(8)
    }
}

export { TesoroGramSE, ProfileState, SpectrumState}
export * as Profile from './profile';
export * as Spectrum from './spectrum';