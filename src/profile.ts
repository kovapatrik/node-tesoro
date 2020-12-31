enum ProfileSelect {
    Profile1 = 1,
    Profile2,
    Profile3,
    Profile4,
    Profile5,
    PC
}

enum Effect {
    Standard = 0,
    Trigger,
    Ripple,
    Firework,
    Radiation,
    Breathing,
    Wave,
    Spectrum,
    RECL1,
    RECL2
}

enum Brightness {
    B0 = 0,
    B25,
    B50,
    B75,
    B100
}

enum EffectColor {
    Static,
    Cycle
}

export {
    ProfileSelect,
    Effect,
    Brightness,
    EffectColor
}