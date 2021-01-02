import hungarian from "./hungarian";

export declare interface Layout {
    key_index: { [key: string]: { index: number; r: number; g: number; b: number; } },
    layout: string[]
}

export class Layouts  {
    layouts : {[key: string] : Layout} = {
        hungarian,
    }

    get = (layout : string) => (this.layouts[layout])
}