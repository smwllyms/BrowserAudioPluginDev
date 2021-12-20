import * as AUDIO from "./audiolib.js";
import ProgramBrowser from "../util/programbrowser.js";

let exports = {};
Object.defineProperty(exports, "Symbol(Symbol.toStringTag)", {value:"Module"});

// Add module to exports
const addModule = function(key, module) {
    Object.defineProperty(exports, key, {
        get: function() { return module; }
    });    
}

// Add library to exports
const addLibrary = function(lib) {
    let keys = Object.keys(lib);
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        addModule(key, lib[key]);
    }
}

// ADD LIBS AND MODULES HERE
addLibrary(AUDIO);
addModule("ProgramBrowser", ProgramBrowser);

export {exports};