import HID from "node-hid";
import * as spectrum from "./spectrum";
import * as utils from "./utils";
import * as profile from "./profile"
import inquirer from 'inquirer'

interface ProfileState{
    profile_num?: profile.ProfileSelect
    r?: number
    g?: number
    b?: number
    effect?: profile.Effect
    brightness?: profile.Brightness
    effect_color?: profile.EffectColor
};

class TesoroGramSE {
    keyboard: HID.HID;
    profile_state : ProfileState;
    constructor(keyboard : HID.HID) {
        this.keyboard = keyboard;
        this.profile_state = {
            profile_num: profile.ProfileSelect.Profile1,
            r: 243,
            g: 152,
            b: 0,
            effect: profile.Effect.Standard,
            brightness: profile.Brightness.B100,
            effect_color: profile.EffectColor.Static
        }
    }

    async changeProfile(profile_num: profile.ProfileSelect) {
        if (profile_num === undefined) {
            console.error("You can't change the profile to NONE"!);
        } else {
            let packet = profile.PACKET_CHANGE_PROFILE.map((item) => {return item == 'profile' ? profile_num : item;});
            this.profile_state.profile_num = profile_num;
            await this.sendCommand(utils.packetToByteArray(packet), 'setProfile');
        }
    }

    async setProfileSettings(data: ProfileState) {
        if (this.profile_state.profile_num === undefined) {
            console.error('Profile cannot be set or is undefined');
        } else if (!Object.values(data).every(x => x != undefined)){
            console.error("Can't set properties to undefined");
        } else {
            let init_packet = utils.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
            await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
            if (this.profile_state.profile_num != profile.ProfileSelect.PC) {
                let middle_packet = utils.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
                await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
            }

            let settings_packet = profile.PACKET_PROFILE_SETTINGS;

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

        let init_packet = utils.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
        let middle_packet = utils.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
        let endPacket = spectrum.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});

        
        let packet2 = spectrum.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
        let keys  :{ [key: string]: number } ={}
        const getKey = async (i: number) => {
            let packet1 = spectrum.TEST_PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
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

    async setKeyColor(key : string, r: number = 0, g: number = 0, b: number = 0) {
        if (!(key in spectrum.KEYS)) {
            console.error('Key is not properly set.')
        } else {
            let init_packet = utils.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
            await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
            if (this.profile_state.profile_num != profile.ProfileSelect.PC) {
                let middle_packet = utils.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
                await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
            }
            let endPacket = spectrum.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});

            let packet1 = spectrum.TEST_PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
            let packet2 = spectrum.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});

            let key_pos = spectrum.KEYS[key];
            packet1[key_pos] = r;
            packet1[key_pos + 128] = g;
            packet2[key_pos] = b;

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
export { ProfileSelect, Brightness, Effect, EffectColor } from './profile';