import { WritableSignal } from "@angular/core";

export interface MapModel {
    image: string;
    width: number;
    height: number;
    defaultPinSize: number;
    click: WritableSignal<string>;
}