import hungarian from "./hungarian";


interface SimpleLayout {
    layout: {
        default: string[],
        shift?: string[],
    },
    display?: object
}

export interface Layout {
    key_index: { [key: string]: { index: number; r: number; g: number; b: number; } },
    gui: { main: SimpleLayout; controlPad?: SimpleLayout; arrows?: SimpleLayout; numPad?: SimpleLayout; numPadEnd?:SimpleLayout;}
}

export class Layouts  {
    layouts : {[key: string] : Layout} = {
        hungarian,
    }

    get = (layout : string) => (this.layouts[layout])
}