import AudioNode from "./audionode.js";

export class DestinationNode extends AudioNode {
    constructor(parentDOM, context) {
        super(parentDOM, context, "Destination");

        this.metaType = "dest";

        // Our destination
        this.processor = context.destination;

        // We don't want an out port or delete
        this.ports.removeChild(this.portOut);
        this.grabber.removeChild(this.exitBtn);
    }
}