import { DefaultWorld } from "./World";


export class Myrian {
    world: string[][];
    resources: number;

    constructor() {
        this.world = DefaultWorld;
        this.resources = 0;
        console.log(this);
    }
}