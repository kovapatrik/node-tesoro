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
    r?: number
    g?: number
    b?: number
    effect?: profile.Effect
    brightness?: profile.Brightness
    effect_color?: profile.EffectColor
};

const init_pstate : ProfileState = {
    _id: profile.ProfileSelect.Profile1,
    r: 243,
    g: 152,
    b: 0,
    effect: profile.Effect.Standard,
    brightness: profile.Brightness.B100,
    effect_color: profile.EffectColor.Static
}

class TesoroGramSE {
    keyboard: HID.HID;
    profile_state : ProfileState;
    keys: Layout['key_index'];
    layout_str: Layout['gui'];
    spectrum_effect: spectrum.SpectrumEffect;
    constructor(layout: string, callback?: Function, pstate: ProfileState = init_pstate) {
        const devices = HID.devices();
        this.keyboard = new HID.HID(devices.filter(x => x.path && x.productId == 0x2057 && x.interface == 1 && x.path.includes("col05"))[0].path!);
        this.profile_state = pstate;
        this.spectrum_effect = spectrum.SpectrumEffect.Standard;
        this.keys = layouts.get(layout).key_index,
        this.layout_str = layouts.get(layout).gui;
        if (callback) {
            const listener = new HID.HID(devices.filter(x => x.path && x.productId == 0x2057 && x.interface == 2)[0].path!);
            listener.on('data', (data) => {
                callback(utils.inputBufferToData(data));
            });
        }
    }

    async changeProfile(_id: profile.ProfileSelect) {
        if (_id === undefined) {
            console.error("You can't change the profile to NONE"!);
        } else {
            let packet = packets.PACKET_CHANGE_PROFILE.map((item) => {return item == 'profile' ? _id : item;});
            this.profile_state._id = _id;
            await this.sendCommand(utils.packetToByteArray(packet), 'setProfile');
        }
    }

    setProfileSettings(data: ProfileState = {_id: this.profile_state._id}) {
        if (this.profile_state._id === undefined) {
            console.error('Profile cannot be to undefined');
        } else {
            this.profile_state = {...this.profile_state, ...data};
        }
    }

    async sendProfileSettings() {
        let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
            await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
            if (this.profile_state._id != profile.ProfileSelect.PC) {
                let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
                await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
            }
            let settings_packet = packets.PACKET_PROFILE_SETTINGS;
            for(const d of Object.entries(this.profile_state)) {
                const param = d[0];
                const value = d[1];
                settings_packet = settings_packet.map((item) => {return item == param ? value : item;});
            }
            await this.sendCommand(utils.packetToByteArray(settings_packet), 'settingsPacket', 280);
    }

    setSpectrumSettings(change_keys : {[key: string] : {index?:number; r:number; g: number; b: number;}}, e : spectrum.SpectrumEffect|undefined = undefined) {
        if (change_keys === undefined && e === undefined) {
            console.log('There is nothing to do. Either you set key or spectrum effect to something.');
        } else {
            this.spectrum_effect = e !== undefined ? e : this.spectrum_effect;
            for (const [key, color] of Object.entries(change_keys)) {
                if (key !== undefined && Object.keys(this.keys).includes(key)) {
                    this.keys[key].r = color.r;
                    this.keys[key].g = color.g;
                    this.keys[key].b = color.b;
                }
            }
        }
    }

    async sendSpectrumSettings() {
        let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
        await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
        if (this.profile_state._id != profile.ProfileSelect.PC) {
            let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
            await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
        }
        let endPacket = packets.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_state._id : item == 'effect' ? this.spectrum_effect : item;});

        let packet1 = packets.PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
        let packet2 = packets.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
        for (const k of Object.values(this.keys)) {
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
                setTimeout(() => {
                    this.keyboard.sendFeatureReport(data);
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

        let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
        let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
        let endPacket = packets.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_state._id : item;});

        
        let packet2 = packets.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
        let keys  :{ [key: string]: number } ={}
        const getKey = async (i: number) => {
            let packet1 = packets.PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_state._id : item;});
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

export { TesoroGramSE, ProfileState }
export * as Profile from './profile';
export * as Spectrum from './spectrum';