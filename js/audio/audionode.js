function drawLine(connectArrow, x1, y1, x2, y2) {
    if (x2 < x1) {
        let tmp;
        tmp = x2 ; x2 = x1 ; x1 = tmp;
        tmp = y2 ; y2 = y1 ; y1 = tmp;
    }

    let lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    let m = (y2 - y1) / (x2 - x1);

    let deg = Math.atan(m) * 180 / Math.PI;

    connectArrow.style.transform = "rotate(" + deg + "deg)";
    connectArrow.style.width = lineLength + "px";
    connectArrow.style.top = y1 + "px";
    connectArrow.style.left = x1 + "px";
}

export default class AudioNode {
    constructor(parentDOM, context, title) {
        // HTML
        this.elem = document.createElement("div");
        this.elem.classList += "audionode";

        // Add handle to move
        this.grabber = document.createElement("div");
        this.grabber.classList += "grabber";
        this.elem.appendChild(this.grabber);
        // Add x
        this.exitBtn = document.createElement("div");
        this.exitBtn.classList += "exit_btn";
        this.exitBtn.addEventListener("click", ()=>this.deleteNode(this));
        this.exitBtn.onmousedown = function(e){e.stopPropagation();};
        this.grabber.appendChild(this.exitBtn);

        // Add label
        this.title = document.createElement("p");
        this.title.innerText = title;
        this.elem.appendChild(this.title);

        // Set default state
        this.movingState = "idle";

        // Add ports
        // Wrapper / Container
        this.ports = document.createElement("div");
        this.ports.classList.add("ports");

        // In and out
        this.portIn = document.createElement("div");
        this.portOut = document.createElement("div");
        this.portIn.classList.add("port");
        this.portIn.setAttribute("inport", 1);
        this.portIn.node = this;
        this.portOut.classList.add("port");
        this.portIn.style.marginLeft = "-10px";
        this.portIn.style.marginTop = "-10px";
        this.elem.appendChild(this.ports);
        this.portOut.style.marginLeft = "190px";
        this.portOut.style.marginTop = "-20px";
        this.ports.appendChild(this.portIn);
        this.ports.appendChild(this.portOut);

        // Connections
        this.connections = [];

        // Add to parent elem
        parentDOM.appendChild(this.elem);
        this.parentDOM = parentDOM;
        let me = this;

        // Allow for movement
        this.grabber.addEventListener("mousedown", (e)=>{
            this.movingState = "translating";
            this.connections.forEach((connection)=>{
                connection.movingState = "moving";
            });
        });
        this.elem.addEventListener("mouseup", (e)=>{
            if (this.movingState === "translating") {
                // this.movingState = "idle";
                this.connections.forEach((connection)=>{
                    connection.movingState = "idle";
                });
                this.movingState = "idle";
            }
        });
        document.documentElement.addEventListener("mouseup", function(e){
            if (me.movingState === "connecting") {
                document.currentArrow.onRelease(e);
            }
        });
        document.documentElement.addEventListener("mousemove", (e)=>{
            if (this.movingState === "translating") {
                // this.elem.style.left = e.x - this.elem.getBoundingClientRect().width / 3 + "px";
                // this.elem.style.top =  e.y - this.elem.getBoundingClientRect().height / 8 + "px";
                this.setPosition( e.x - this.elem.getBoundingClientRect().width / 3,
                                e.y - this.elem.getBoundingClientRect().height / 8);
                this.recalculatePos();
            }
        })
        // We are creating a connection
        this.portOut.addEventListener("mousedown", (e)=>{
            let line = document.elementFromPoint(e.clientX, e.clientY);
            if (!line.classList.contains("connectArrow")) {
                this.movingState = "connecting";
                this.createConnectArrow();
            }
        });

        // Audio Context
        this.ctx = context;
        
        // Create gui preview
        this.guiPreview = document.createElement("div");
        let gui = this.guiPreview;
        gui.style.width = "400px";
        gui.style.height = "100px";
        gui.style.backgroundColor = "#ddbb44";
        gui.style.backgroundImage = "";
        gui.isDown = false;
        gui.clickPending = false;
        gui.resizeMode = 0;
        let grace = 5;
        document.addEventListener("mousemove", e=>{
            if (gui.isDown) {
                let rect = gui.getBoundingClientRect();
                if (e.target == gui) {
                    if (gui.clickPending) {
                        let w = (rect.width - (e.pageX - rect.x) < grace);
                        let h = (rect.height - (e.clientY - rect.y) < grace);
                        if (w && h) {
                            gui.resizeMode = 3;
                        }
                        else if (w) {
                            gui.resizeMode = 1;
                        }
                        else if (h) {
                            gui.resizeMode = 2;
                        }
                        gui.clickPending = false;
                    }
                }
                if (gui.resizeMode == 3) {
                    gui.style.width = (e.pageX - rect.x) + "px";
                    gui.style.height = (e.clientY - rect.y) + "px";
                }
                else if (gui.resizeMode == 1) {
                    gui.style.width = (e.pageX - rect.x) + "px";
                }
                else if (gui.resizeMode == 2) {
                    gui.style.height = (e.clientY - rect.y) + "px";
                }
                else {
                }
            }
        });
        document.addEventListener("mousedown", (e)=>{
            if (e.target == gui){
                gui.isDown=true;
                gui.clickPending=true;
            }
        });
        document.addEventListener("mouseup", ()=>{gui.isDown=false;gui.resizeMode=0});

        // Set our initial port positions
        // Get our first positions
        this.refreshGUI();
        this.recalculatePos();
    }

    getPortPos(port){
        let rect = port.getBoundingClientRect();
        let pos = {};
        pos.x = rect.left + rect.width / 2;
        pos.y = rect.top + rect.height / 2;
        return pos;
    }

    recalculatePos() {
        let rect = this.portOut.getBoundingClientRect();
        this.posX = rect.width / 2;
        this.posY = rect.height / 2;
    }

    createConnectArrow() {

        let connectArrow = document.createElement("div");
        connectArrow.classList.add("connectArrow");
        connectArrow.movingState = "moving";
        this.movingState = "connecting";
        document.currentArrow = connectArrow;

        // We are cutting a wire
        connectArrow.addEventListener("click", ()=>{
            this.disconnectNode(connectArrow);
        });
        // When we release - are we making a connection?
        let me = this;
        connectArrow.onRelease = function(e) {
            let x = e.clientX, y = e.clientY;

            connectArrow.style.visibility = "hidden";

            let pIn = document.elementFromPoint(x, y);

            if (pIn.hasAttribute("inport") &&
                pIn !== me.portIn) {
                // Fails if the connection already exists
                if (!me.connectNode(connectArrow, pIn.node))
                me.portOut.removeChild(connectArrow);
                else {
                    connectArrow.movingState = "idle";
                    connectArrow.style.visibility = "visible";
                }
            }
            else {
                // Delete the connection
                me.portOut.removeChild(connectArrow);
            }
            me.movingState = "idle";
            document.currentArrow = null;
        };

        document.documentElement.addEventListener("mousemove", (e)=>{
            if (!connectArrow) return;
            if (this.movingState === "connecting"
                && connectArrow.movingState === "moving") {
                this.recalculatePos();

                let x1 = this.posX;
                let y1 = this.posY;
                let myRect = this.getPortPos(this.portOut);
                let x2 = e.x - myRect.x + x1;
                let y2 = e.y - myRect.y + y1;

                drawLine(connectArrow, x1, y1, x2, y2);
            }
            else if (connectArrow.movingState === "moving") {
                if (connectArrow.connection == null) {
                    connectArrow = null;
                    return;
                }
                this.recalculatePos();

                let x1 = this.posX;
                let y1 = this.posY;
                let otherRect = this.getPortPos(connectArrow.connection[1].portIn);
                let myRect = this.getPortPos(this.portOut);
                let x2 = otherRect.x - myRect.x + x1;
                let y2 = otherRect.y - myRect.y + y1;

                drawLine(connectArrow, x1, y1, x2, y2);
            }
        });
        this.portOut.appendChild(connectArrow);
    }

    connectNode(connectArrow, node) {
        let myNode;
        switch (this.metaType) {
            case "osc":
                myNode = this.gainNode;
                break;
            case "effect":
                myNode = this.processor;
                break;
            default: break;
        }

        // Check if a connection exists
        let flag = false;
        this.connections.forEach((conn)=>{
            if (conn.connection[1] == node) flag = true; 
        });

        if (myNode && !flag){
            myNode.connect(node.processor);
            connectArrow.connection = [this, node];
            this.connections.push(connectArrow);
            node.connections.push(connectArrow);
            return true;
        }
        else return false;
    }

    disconnectNode(connectArrow) {
        let node = connectArrow.connection[1];
        let me = connectArrow.connection[0];
        if (node) {
            let myNode = null;
            switch (me.metaType) {
                case "osc":
                    myNode = me.gainNode;
                    break;
                case "effect":
                    myNode = me.processor;
                    break;
                default: break;
            }

            if (myNode) {
                myNode.disconnect(node.processor);
                connectArrow.movingState = "idle";
                me.connections = me.connections.filter(n=>n!=connectArrow);
                node.connections = node.connections.filter(n=>n!=connectArrow);
                me.portOut.removeChild(connectArrow);
                connectArrow = null;
            }
        }
    }

    setBoundaryElem(elem) {
        this.boundaryElem = elem;
        let rect = elem.getBoundingClientRect();
        let myRect = this.elem.getBoundingClientRect();
        this.boundary = {};
        this.boundary.xMin = rect.x;
        this.boundary.yMin = rect.y;
        this.boundary.xMax = rect.x + rect.width - myRect.width;
        this.boundary.yMax = rect.y + rect.height - myRect.height;

    }

    setPosition(x, y) {
        if (!this.boundary) {
            this.elem.style.left = x + "px";
            this.elem.style.top = y + "px";
            return;
        }
        // Recheck for change in size
        this.setBoundaryElem(this.boundaryElem);
        if (x > this.boundary.xMin && x < this.boundary.xMax) {
            this.elem.style.left = x + "px";
        }
        if (y > this.boundary.yMin && y < this.boundary.yMax) {
            this.elem.style.top = y + "px";
        }
    }

    refreshGUI() {
        let y = this.elem.getBoundingClientRect().height;
        this.ports.style.marginTop = (-y/2 + 5) + "px";
    }

    deleteNode(me) {
        me.connections.forEach((conn)=>{
            this.disconnectNode(conn);
        });
        me.parentDOM.removeChild(me.elem);
        if (me.deletedCallback)
            me.deletedCallback();
    }
}