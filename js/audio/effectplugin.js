import AudioNode from "./audionode.js";

export class EffectPlugin extends AudioNode {
    constructor(parentDOM, context, destination) {
        super(parentDOM, context, "effect plugin");

        this.metaType = "effect";

        // The function body
        this.func = "";

        // Append bypass button
        this.bypass = document.createElement("a");
        this.bypass.innerText = "bypass";
        this.bypass.classList.add("bypass");
        this.bypassed = false;
        this.bypass.addEventListener("click", ()=>{
            if (!this.bypassed) {
                this.bypass.classList.add("bypassed");
                this.bypass.innerText = "unbypass";
                this.bypassed = true;
            }
            else {
                this.bypass.classList.remove("bypassed");
                this.bypass.innerText = "bypass";
                this.bypassed = false;
            }
            let msg = {};
            msg.type = "bypass";
            this.processor.port.postMessage(msg);
        });
        this.elem.appendChild(this.bypass);
        
        // Create audio processor node (Send in our user function)
        this.processor = new AudioWorkletNode(context, "audio-processor");

    }

    setProgram(s) {
        this.program = s;
    }
}