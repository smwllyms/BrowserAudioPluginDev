export default class ProgramBrowser {

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
            // Replace all calls to console.log with our log function
            if (out)
                func = func.replaceAll("console.log(", "myLog(");
            // Append it to our main function string
            s += func;
            try {
                // Log result
                // myLog(new Function(s)());
                callback(new Function(s));
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
            fn.value = 'function sqr(n) { return n*n; }\n\nfunction demo(name, num) {\n    return name + " has " + sqr(num) + " apples!";\n}\n\nconsole.log("You can do this, too!");\n\n// Return the value to see output!\nreturn demo(a1,a2);';
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