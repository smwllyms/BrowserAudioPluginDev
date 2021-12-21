export default class ProgramBrowser {

    var_declarations = [
        "int", "float", "double", "string", "String"
    ]

    function_declarations = [
        "void"
    ]

    constructor(callback, btn, fn, args, out) {
        // Logs string s to output textarea
        const myLog = function(s) {
            if (out)
                out.value += s + '\n';
        };

        // On click run button
        btn.addEventListener("click", () => {
            if (out) {
                // In case we errored last time
                out.style.backgroundColor = "white";
                // Reset output
                out.value = "";
            }
            // Isolate args
            let argVals;
            if (args) argVals = args.value.split(",");
            else argVals = [];
            // This will be our main function string
            let s = "";
            // Prepend each arg as a global var for user function
            argVals.forEach(a=>{
                s += a + ";";
            });
            // Get the user function string
            let func = fn.value;
            // Convert to JS (ish)
            // remove variable declarations
            this.var_declarations.forEach((dec)=>{
                func = func.replaceAll(dec, "var");
            });
            // remove function declarations
            this.function_declarations.forEach((dec)=>{
                func = func.replaceAll(dec, "function");
            });
            // Replace all calls to console.log with our log function
            if (out)
                func = func.replaceAll("console.log(", "myLog(");
            // Eliminate array declarations and pointer variables
            func = func.replaceAll("[]", "");
            const re1 = /function\s*[A-Za-z0-9]*\s*\([A-Za-z0-9\s,\*]*\)/ig;
            let found = func.match(re1);
            if (found) {
                found.forEach((term)=>{
                    let fixed = term.replaceAll("*", "").replaceAll("var", "");
                    func = func.replaceAll(term, fixed);
                })
            }
            // Append it to our main function string
            s += func;
            // We need to call main process method
            s += "process(inputs, outputs);";
            try {
                // Log result
                // myLog(new Function(s)());
                // callback(new Function(s));
                callback(s);
            }
            catch (err) {
                // Log errors
                myLog("ERROR: " + err);
                // Set output background to red color
                if (out)
                    out.style.backgroundColor = "MistyRose";
            }
        });

        // On click load demo button
        function loadDemo() {
            args.value = 'a1="Sam", a2=3';
            loadProgram('function sqr(n) { return n*n; }\n\nfunction demo(name, num) {\n    return name + " has " + sqr(num) + " apples!";\n}\n\nconsole.log("You can do this, too!");\n\n// Return the value to see output!\nreturn demo(a1,a2);');
        }
        function loadProgram(s) {
            fn.value = s;
        }

        // On click clear button
        function clearFn() {
            fn.value = "";
        }

        // On tab
        fn.addEventListener('keydown', function(e){ 
            if (e.keyCode == 9)  {
                // Stop from tabbing
                e.preventDefault();
                // Save initial cursor position
                let pos = fn.selectionStart;
                // Just add 4 spaces (a tab) at cursor position
                fn.value = fn.value.slice(0, pos) + "    " + fn.value.slice(pos);
                // Also move cursor
                fn.selectionStart = pos + 4;
                fn.selectionEnd = pos + 4;

            }
        });
    }
}