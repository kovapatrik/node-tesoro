import HID from "node-hid";
import * as spectrum from "./spectrum";
import * as utils from "./utils";
import * as profile from "./profile"
import * as packets from "./packets"
import { Layouts, Layout } from "./layouts/layouts";
import inquirer from 'inquirer'

const layouts = new Layouts;

interface ProfileState {
    profile_num?: profile.ProfileSelect
    r?: number
    g?: number
    b?: number
    effect?: profile.Effect
    brightness?: profile.Brightness
    effect_color?: profile.EffectColor
};

const init_pstate : ProfileState = {
    profile_num: profile.ProfileSelect.Profile1,
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
    layout_str: Layout['layout'];
    spectrum_effect: spectrum.SpectrumEffect;
    constructor(keyboard : HID.HID, layout: string, pstate: ProfileState = init_pstate, keys = layouts.get(layout).key_index) {
        this.keyboard = keyboard;
        this.profile_state = pstate;
        this.spectrum_effect = spectrum.SpectrumEffect.Standard;
        this.keys = keys,
        this.layout_str = layouts.get(layout).layout;
    }

    async changeProfile(profile_num: profile.ProfileSelect) {
        if (profile_num === undefined) {
            console.error("You can't change the profile to NONE"!);
        } else {
            let packet = packets.PACKET_CHANGE_PROFILE.map((item) => {return item == 'profile' ? profile_num : item;});
            this.profile_state.profile_num = profile_num;
            await this.sendCommand(utils.packetToByteArray(packet), 'setProfile');
        }
    }

    async setProfileSettings(data: ProfileState = {profile_num: this.profile_state.profile_num}) {
        if (this.profile_state.profile_num === undefined) {
            console.error('Profile cannot be to undefined');
        } else {
            let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
            await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
            if (this.profile_state.profile_num != profile.ProfileSelect.PC) {
                let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
                await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
            }

            let settings_packet = packets.PACKET_PROFILE_SETTINGS;

            this.profile_state = {...this.profile_state, ...data};

            for(const d of Object.entries(this.profile_state)) {
                const param = d[0];
                const value = d[1];
                settings_packet = settings_packet.map((item) => {return item == param ? value : item;});
            }
            await this.sendCommand(utils.packetToByteArray(settings_packet), 'settingsPacket', 280);
        }
    }

    private async initKeys() {

        const q = [{
            name: "key",
            message: "Which key?"
        }];

        let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
        let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
        let endPacket = packets.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});

        
        let packet2 = packets.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
        let keys  :{ [key: string]: number } ={}
        const getKey = async (i: number) => {
            let packet1 = packets.PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
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
            })
            console.log(keys);
        }
        getKey(8)
    }

    async setKeyColor(key : string|undefined = undefined, r: number = 0, g: number = 0, b: number = 0, e : spectrum.SpectrumEffect|undefined = undefined) {
        if (key === undefined && e === undefined) {
            console.log('There is nothing to do. Either you set key or spectrum effect to something.');
        } else if (!(key! in this.keys)) {
            console.error('Key is not in the dictionary.')
        } else {
            let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
            await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
            if (this.profile_state.profile_num != profile.ProfileSelect.PC) {
                let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
                await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
            }

            this.spectrum_effect = e ? e : this.spectrum_effect;
            let endPacket = packets.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item == 'effect' ? this.spectrum_effect : item;});

            let packet1 = packets.PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
            let packet2 = packets.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});

            if (key !== undefined) {
                this.keys[key].r = r;
                this.keys[key].g = g;
                this.keys[key].b = b;
            }

            for (const k of Object.values(this.keys)) {
                packet1[k.index] = k.r;
                packet1[k.index + 128] = k.g;
                packet2[k.index] = k.b;
            }

            await this.sendCommand(utils.packetToByteArray(packet1), 'spectrum1Packet', 150);
            await this.sendCommand(utils.packetToByteArray(packet2), 'spectrum2Packet'); 
            await this.sendCommand(utils.packetToByteArray(endPacket), 'spectrumEndPacket', 280);
        }
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
}

export { TesoroGramSE, ProfileState }
export * as Profile from './profile';
export * as Spectrum from './spectrum';