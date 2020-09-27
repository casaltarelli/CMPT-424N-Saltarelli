/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        // Display Updates
        Control.updatePCBDisplay = function () {
            // Get Elements
            var table = document.getElementById("tablePCB");
            var newTBody = document.createElement("tbody");
            table.style.display = "block";
            // Create + Update Row w/ PCB Data
            var row;
            row = newTBody.insertRow(-1);
            row.insertCell(-1).innerHTML = _PCB.state.toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _PCB.PC;
            row.insertCell(-1).innerHTML = _PCB.Acc.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _PCB.Xreg.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _PCB.Yreg.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _PCB.Zflag.toString(16).toLocaleUpperCase();
            // Replace Old TBody
            table.replaceChild(newTBody, table.childNodes[0]);
        };
        Control.updateCPUDisplay = function () {
            var opCodeInfo = { "A9": { "operandNumber": 1 },
                "AD": { "operandNumber": 2 },
                "8D": { "operandNumber": 2 },
                "6D": { "operandNumber": 2 },
                "A2": { "operandNumber": 1 },
                "AE": { "operandNumber": 2 },
                "A0": { "operandNumber": 1 },
                "AC": { "operandNumber": 2 },
                "EA": { "operandNumber": 0 },
                "00": { "operandNumber": 0 },
                "EC": { "operandNumber": 2 },
                "D0": { "operandNumber": 1 },
                "EE": { "operandNumber": 2 },
                "FF": { "operandNumber": 0 }
            };
            // Get Elements
            var table = document.getElementById("tableCPU");
            var row = table.rows[1];
            var currentInstruction = TSOS.Utils.padHexValue(_CPU.IR.toString(16).toLocaleUpperCase());
            // Validate Current Instruction
            if (!opCodeInfo[currentInstruction]) {
                return; // Don't Update
            }
            // Update Row for CPU Data
            row.cells[0].innerHTML = (_CPU.PC - opCodeInfo[currentInstruction].operandNumber - 1).toString();
            row.cells[1].innerHTML = currentInstruction;
            row.cells[2].innerHTML = _CPU.Acc.toString(16).toLocaleUpperCase();
            row.cells[3].innerHTML = _CPU.Xreg.toString(16).toLocaleUpperCase();
            row.cells[4].innerHTML = _CPU.Yreg.toString(16).toLocaleUpperCase();
            row.cells[5].innerHTML = _CPU.Zflag.toString(16);
        };
        Control.updateMemoryDisplay = function () {
            var opCodeInfo = { "A9": { "operandNumber": 1 },
                "AD": { "operandNumber": 2 },
                "8D": { "operandNumber": 2 },
                "6D": { "operandNumber": 2 },
                "A2": { "operandNumber": 1 },
                "AE": { "operandNumber": 2 },
                "A0": { "operandNumber": 1 },
                "AC": { "operandNumber": 2 },
                "EA": { "operandNumber": 0 },
                "00": { "operandNumber": 0 },
                "EC": { "operandNumber": 2 },
                "D0": { "operandNumber": 1 },
                "EE": { "operandNumber": 2 },
                "FF": { "operandNumber": 0 }
            };
            // Update Display
            var table = document.getElementById("tableMemory");
            var newTBody = document.createElement("tbody");
            table.style.display = "block";
            // Add Memory
            var row;
            var rowLabel = "0x00";
            var rowNumber = 0;
            var placeNumber = 0;
            var physicalAddress = 0;
            var memory = _MemoryAccessor.dump();
            var highlightedCell;
            for (var i = 0; i < _MemoryAccessor.getTotalSize() / 8; i++) {
                // Create Row
                row = newTBody.insertRow(-1);
                rowNumber = 8 * i;
                if (rowNumber > 255) {
                    placeNumber = 2;
                }
                else if (rowNumber > 15) {
                    placeNumber = 3;
                }
                else {
                    placeNumber = 4;
                }
                row.insertCell(-1).innerHTML = rowLabel.slice(0, placeNumber) + rowNumber.toString(16).toLocaleUpperCase();
                // Populate respective Row with cells
                var cell = void 0;
                var currentInstruction = void 0;
                var operandHighlights = [];
                for (var j = 0; j < 8; j++) {
                    cell = row.insertCell(-1);
                    cell.innerHTML = memory[physicalAddress].toLocaleUpperCase();
                    cell.id = "border-cell";
                    currentInstruction = TSOS.Utils.padHexValue(_CPU.IR.toString(16).toLocaleUpperCase());
                    // Add Hover being read in the Display
                    if (_CPU.PCB && _CPU.isExecuting && opCodeInfo[currentInstruction]) {
                        if (_MemoryManager.baseRegister + _CPU.PC - opCodeInfo[currentInstruction].operandNumber - 1 == physicalAddress) {
                            cell.style.backgroundColor = "#E6F2FF";
                            highlightedCell = cell;
                            operandHighlights[0] = opCodeInfo[currentInstruction].operandNumber;
                            operandHighlights[1] = false;
                            // Check for D0 Branch
                            if (currentInstruction == "D0") {
                                operandHighlights[0] = 0;
                            }
                            // Highlight Operands
                            if (operandHighlights[0] > 0 && operandHighlights[1]) {
                                cell.style.backgroundColor = "#80BFFF";
                                highlightedCell = cell;
                                operandHighlights[0]--;
                            }
                            // Skip Highlight Operands
                            if (operandHighlights[0] > 0 && !operandHighlights[1]) {
                                operandHighlights[1] = true;
                            }
                        }
                    }
                    physicalAddress++;
                }
                // Update TBody
                table.replaceChild(newTBody, table.childNodes[0]);
                if (highlightedCell) {
                    highlightedCell.scrollIntoView({ block: "nearest" });
                }
            }
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // ... Create and initialize Main Memory 
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
