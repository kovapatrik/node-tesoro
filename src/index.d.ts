import HID from "node-hid";
import * as spectrum from "./spectrum.js";
import * as profile from "./profile.js";
interface ProfileState {
    profile_num?: profile.ProfileSelect;
    r?: number;
    g?: number;
    b?: number;
    effect?: profile.Effect;
    brightness?: profile.Brightness;
    effect_color?: profile.EffectColor;
}
declare class TesoroGramSE {
    keyboard: HID.HID;
    profile_state: ProfileState;
    spectrum_effect: spectrum.SpectrumEffect;
    constructor(keyboard: HID.HID);
    changeProfile(profile_num: profile.ProfileSelect): Promise<void>;
    setProfileSettings(data: ProfileState): Promise<void>;
    private initKeys;
    setKeyColor(key: string, r?: number, g?: number, b?: number, e?: spectrum.SpectrumEffect): Promise<void>;
    private sendCommand;
}
export { TesoroGramSE, ProfileState };
export { ProfileSelect, Brightness, Effect, EffectColor } from './profile.js';
