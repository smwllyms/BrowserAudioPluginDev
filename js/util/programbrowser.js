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
            // ------------------------
            // Convert to JS (ish)
            // remove function declarations
            let firstIdx = 0;
            // this.function_declarations.forEach((dec)=>{
            //     func = func.replaceAll(dec, "function");
            // });
            const isSpace = function (c) {
                return c == ' ' || c == '\t' || c == '\n';
            }
            while (firstIdx < func.length)
            {
                // Find a bracket (guarunteed to be func)
                while (firstIdx < func.length && func[firstIdx] != '{') firstIdx++; 
                // If we are at the end quit
                if (firstIdx == func.length)
                    break;
                // Find function def type (i.e. float, void)
                // First find first parenthese
                while (func[firstIdx] != '(') firstIdx--;
                // Go to function name
                while (isSpace(func[firstIdx])) 
                    firstIdx--;
                // Skip through name
                while (!isSpace(func[firstIdx]))  
                    firstIdx--;     
                // Go to function def type (skip space)
                while (isSpace(func[firstIdx]))  
                    firstIdx--;
                let endDefType = firstIdx + 1;
                // Skip through name
                while (!isSpace(func[firstIdx]))  
                    firstIdx--;    
                // Replace deftype with 'function'
                firstIdx++;
                func = [func.slice(0, firstIdx), "function", func.slice(endDefType)].join('');
                // Wait until we have reached the same level of brackets
                let level = 0;
                let lastIdx = firstIdx;
                while (lastIdx < func.length)
                {
                    if (func[lastIdx] == '{')
                        level++;
                    else if (func[lastIdx] == '}')
                    {
                        level--;
                        if (level == 0)
                            break;
                    }
                    lastIdx++;
                }
                // We are now past function.
                firstIdx = lastIdx;
            }
            // remove variable declarations
            this.var_declarations.forEach((dec)=>{
                func = func.replaceAll(dec, "var");
            });
            // ------------------------
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