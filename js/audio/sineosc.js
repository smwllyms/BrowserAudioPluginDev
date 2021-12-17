import Oscillator from "./oscillator.js";

export class SineOsc extends Oscillator {
    constructor(parentDOM, context, destination) {
        super(parentDOM, context, destination, "sine");
    }
}