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
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }

        // Display Updates
        public static updatePCBDisplay() {
            // Get Elements
            let table = document.getElementById("tablePCB");
            let newTBody = document.createElement("tbody");
            table.style.display = "block";
            
            // Create + Update Row w/ PCB Data
            let row;
            row = newTBody.insertRow(-1);

            row.insertCell(-1).innerHTML = _PCB.state.toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _PCB.PC;
            row.insertCell(-1).innerHTML = _PCB.Acc.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _PCB.Xreg.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _PCB.Yreg.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _PCB.Zflag.toString(16).toLocaleUpperCase();

            // Replace Old TBody
            table.replaceChild(newTBody, table.childNodes[0]);
        }

        public static updateCPUDisplay() {
            let opCodeInfo = {"A9": {"operandNumber": 1},
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
            let table = (<HTMLTableElement >document.getElementById("tableCPU"));
            let row = table.rows[1];
            let currentInstruction = TSOS.Utils.padHexValue(_CPU.IR.toString(16).toLocaleUpperCase());

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
        }

        public static updateMemoryDisplay() {
            let opCodeInfo = {"A9": {"operandNumber": 1},
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
            let table = document.getElementById("tableMemory");
            let newTBody = document.createElement("tbody");

            table.style.display = "block";

            // Add Memory
            let row;
            let rowLabel = "0x00";
            let rowNumber = 0;

            let placeNumber = 0;
            let physicalAddress = 0;
            let memory = _MemoryAccessor.dump();
            let highlightedCell;

            for (let i = 0; i < _MemoryAccessor.getTotalSize() / 8; i++) {
                // Create Row
                row = newTBody.insertRow(-1);

                rowNumber = 8 * i;
                if (rowNumber > 255) {
                    placeNumber = 2
                }else if (rowNumber > 15) {
                    placeNumber = 3;
                } else {
                    placeNumber = 4;
                }

                row.insertCell(-1).innerHTML = rowLabel.slice(0, placeNumber) + rowNumber.toString(16).toLocaleUpperCase();

                // Populate respective Row with cells
                let cell;
                let currentInstruction;
                let operandHighlights = [];

                for (let j = 0; j < 8; j++) {
                    cell = row.insertCell(-1);
                    cell.innerHTML = memory[physicalAddress].toLocaleUpperCase();
                    cell.id = "border-cell"
                    currentInstruction = TSOS.Utils.padHexValue(_CPU.IR.toString(16).toLocaleUpperCase());

                    // Add Hover being read in the Display
                    if (_CPU.PCB && _CPU.isExecuting && opCodeInfo[currentInstruction]) {

                        if (_MemoryManager.baseRegister + _CPU.PC - opCodeInfo[currentInstruction].operandNumber - 1 == physicalAddress) {
                            cell.style.backgroundColor = "#CCCDCF";
                            cell.style.borderColor = "#89B0AE";

                            highlightedCell = cell;
                            operandHighlights[0] = opCodeInfo[currentInstruction].operandNumber;
                            operandHighlights[1] = false;

                            // Check for D0 Branch
                            if (currentInstruction == "D0") {
                                operandHighlights[0] = 0;
                            }

                        }

                        // Highlight Operands
                        if (operandHighlights[0] > 0 && operandHighlights[1]) {
                            //cell.style.borderColor = "#57CC99";
                            cell.style.backgroundColor = "#CCCDCF";
                            highlightedCell = cell;
                            operandHighlights[0]--;
                        }

                        // Skip Highlight Operands for Current Instruction
                        if (operandHighlights[0] > 0 && !operandHighlights[1]) {
                            operandHighlights[1] = true;
                        }
                    }
                    physicalAddress++;
                }

                // Update TBody
                table.replaceChild(newTBody, table.childNodes[0]);

                if (highlightedCell) {
                    highlightedCell.scrollIntoView({block: "nearest"});
                }
            }
        }

        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt + Reset + Step buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnStep")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnNext")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... Create and initialize Main Memory 
            _Memory = new Memory();
            _Memory.init();
            _MemoryAccessor = new MemoryAccessor();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnStep_click(btn): void {
            // Update Step
            _Step = !_Step; 

            // Update Btn CSS + Display Next Btn
            let btnNext = document.getElementById("btnNext");
            btnNext.style.display = _Step ? "inline-block" : "none";

            // Update Spacing
            let btnStart = document.getElementById("btnStartOS");
            let btnHalt = document.getElementById("btnHaltOS");
            let btnReset = document.getElementById("btnReset");

            if (_Step) {
                btnStart.style.marginRight = "30px";
                btnHalt.style.marginRight = "30px";
                btnReset.style.marginRight = "30px";
                //btn.style.marginRight = "5px !important";
            } else {
                btnStart.style.marginRight = "43.5px";
                btnHalt.style.marginRight = "43.5px";
                btnReset.style.marginRight = "43.5px";
                //btn.style.marginRight = "5px !important";
            }
        }

        public static hostBtnNext_click(btn): void {
            if (_Step) {
                _NextStep = true;
            }
        }
    }
}
