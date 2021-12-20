import AudioNode from "./audionode.js";

const default_volume = 0.5;
const scale = 0.03;

class Oscillator extends AudioNode {
    constructor(parentDOM, context, type) {
        super(parentDOM, context, type + " osc");

        this.metaType = "osc";

        // Add Gain label
        let gainlabel = document.createElement("label");
        gainlabel.innerText = "Gain:";
        this.elem.appendChild(gainlabel);

        // Add gain slider
        this.gainKnob = document.createElement("input");
        this.gainKnob.setAttribute("type", "range");
        this.gainKnob.setAttribute("min", "0");
        this.gainKnob.setAttribute("max", "100");
        this.gainKnob.setAttribute("value", "50");
        this.elem.appendChild(this.gainKnob);

        this.gainNode = context.createGain();
        this.gainNode.gain.value = default_volume * scale;

        this.osc = context.createOscillator();
        this.osc.type = type;
        this.osc.connect(this.gainNode);
        this.osc.start();

        this.gainKnob.addEventListener("input", (e)=>{
            this.gainNode.gain.value = e.target.value / 100 * scale;
        });

        // We don't want an in port on Oscillators
        this.ports.removeChild(this.portIn);
    }
}

export { Oscillator };