/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.nameStr = "User";
            this.statusStr = "";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            // whereAmI
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;
            // setname <string>
            sc = new TSOS.ShellCommand(this.shellSetName, "setname", "- Sets username.");
            this.commandList[this.commandList.length] = sc;
            // name 
            sc = new TSOS.ShellCommand(this.shellName, "name", "- Displays username.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- <string> Updates User Status.");
            this.commandList[this.commandList.length] = sc;
            // death
            sc = new TSOS.ShellCommand(this.shellDeath, "death", "- death Displays BSOD Message for OS errors.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- load validates user code and uploads to main memory.");
            this.commandList[this.commandList.length] = sc;
            // run <pid> 
            sc = new TSOS.ShellCommand(this.shellRun, "run", " - <pid> run executes a process by a specified pid.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", " - executes all process in main memory at once.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPs, "ps", " - displays all processes in main memory.");
            this.commandList[this.commandList.length] = sc;
            // clear <pid>
            sc = new TSOS.ShellCommand(this.shellClear, "clear", " - clears a specified segment of memory from a given index.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", " - clears all segments of main memory.");
            this.commandList[this.commandList.length] = sc;
            // kill <pid> 
            sc = new TSOS.ShellCommand(this.shellKill, "kill", " - <pid> kill terminates a process in main memory.");
            this.commandList[this.commandList.length] = sc;
            // killall
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", " - killall terminates all processes in main memory.");
            this.commandList[this.commandList.length] = sc;
            // getschedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", " - getschedule returns the current scheduling algorithm");
            this.commandList[this.commandList.length] = sc;
            // setschedule [rr, fcfs, p]
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", " - setschedule sets the current scheduling algorithm for the CPU");
            this.commandList[this.commandList.length] = sc;
            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", " - <int> set the quantum value for the CPU Schedular.");
            this.commandList[this.commandList.length] = sc;
            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", " - format initilizes the Disk definition for our File System.");
            this.commandList[this.commandList.length] = sc;
            // create
            sc = new TSOS.ShellCommand(this.shellCreate, "create", " - <filename> create a file with a provided name.");
            this.commandList[this.commandList.length] = sc;
            // write
            sc = new TSOS.ShellCommand(this.shellWrite, "write", ' - <filename> "data" writes data to file with a provided name.');
            this.commandList[this.commandList.length] = sc;
            // read
            sc = new TSOS.ShellCommand(this.shellRead, "read", " - <filename> reads a file with a provided name.");
            this.commandList[this.commandList.length] = sc;
            // Display the initial  prompt.
            this.putName();
            this.putPrompt();
        };
        Shell.prototype.putName = function () {
            _StdOut.putText(this.nameStr);
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the name + prompt again.
            // Timeout used to provide ability for program to output command specific data before adding Prompt
            setTimeout(function () {
                if (_Console.currentXPosition > 0) {
                    _StdOut.advanceLine();
                }
                // Display Prompt
                _OsShell.putName();
                _OsShell.putPrompt();
            }, 100);
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                var found = false;
                // Look for Arg in Shell Command List
                for (var i in _OsShell.commandList) {
                    if (_OsShell.commandList[i].command == topic) {
                        found = true;
                        _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                    }
                }
                // Output Undefined if not found
                if (!found) {
                    _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            // Declare Date Object + Output
            var d = new Date();
            _StdOut.putText("Today's Date: " + d);
        };
        Shell.prototype.shellWhereAmI = function (args) {
            // Display Users Location
            _StdOut.putText("5th & Chestnut");
        };
        Shell.prototype.shellSetName = function (args) {
            // Update Username
            if (args.length > 0) {
                _OsShell.nameStr = args[0];
            }
            else {
                _StdOut.putText("Usage: name <string>  Please give a name.");
            }
        };
        Shell.prototype.shellName = function (args) {
            // Display Users set username
            _StdOut.putText(_OsShell.nameStr);
        };
        Shell.prototype.shellStatus = function (args) {
            // Update User Status
            if (args.length > 0) {
                // Reset Status
                _OsShell.statusStr = "";
                // Iterate over Status Args
                var i = 0;
                while (args[i] != null) {
                    _OsShell.statusStr = _OsShell.statusStr + args[i] + " ";
                    i++;
                }
                // Format Status
                _OsShell.statusStr = "Status: " + _OsShell.statusStr;
                //Update Element
                var statusText = document.getElementById("statusMsg");
                statusText.innerHTML = _OsShell.statusStr;
            }
            else {
                _StdOut.putText("Usage: status <string> Please provide a status");
            }
        };
        Shell.prototype.shellDeath = function (args) {
            // Display BSOD
            var canvas = document.getElementById("display");
            canvas.style.backgroundColor = "blue";
            // Clear Canvas
            _StdOut.clearScreen();
            _StdOut.resetXY();
            _StdOut.putText("FATAL ERROR: Shutting down...");
            _Kernel.krnTrapError("Kernal death");
            _Kernel.krnShutdown();
        };
        Shell.prototype.shellLoad = function (args) {
            // Get Textarea Content
            var userInput = document.getElementById("taProgramInput").value;
            // Remove White Space
            userInput = userInput.replace(/\s/g, "");
            // Validate Input via RegEx + Output to Canvas
            var regex = /^[A-Fa-f0-9]+$/;
            // Verify Valid Priority was given
            if (parseInt(args[0]) > 0) {
                if (regex.test(userInput)) {
                    var input = userInput.match(/.{2}/g);
                    var pcb = _MemoryManager.load(input);
                    // Test Load Success
                    if (pcb) {
                        // Add Priority to pcb
                        pcb.priority = parseInt(args[0]);
                        var segment = void 0;
                        segment = pcb.segment;
                        _StdOut.putText("Program with PID " + pcb.pid + " loaded into memory segment " + segment.index + ".");
                    }
                    else {
                        _StdOut.putText("Memory is full. Please clear before loading new process.");
                    }
                }
                else {
                    _StdOut.putText("Hex Code could not be validated. Please try again.");
                }
            }
            else {
                _StdOut.putText("Please provide a priority for the requested process.");
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                // Get Process PCB
                var pid = parseInt(args[0]);
                var pcb = void 0;
                // Find Process within ReadyQueue
                for (var _i = 0, _ResidentList_1 = _ResidentList; _i < _ResidentList_1.length; _i++) {
                    var process = _ResidentList_1[_i];
                    if (process.pid == pid) {
                        pcb = process;
                    }
                }
                // Update Console
                if (!pcb) {
                    _StdOut.putText("Process " + pid + " does not exist.");
                }
                else if (pcb.state === "running") {
                    _StdOut.putText("Process " + pid + " is already running.");
                }
                else if (pcb.state === "terminated") {
                    _StdOut.putText("Process " + pid + " had already ran and has been terminated.");
                }
                else if (_CPU.PCB && _CPU.isExecuting == true) {
                    _StdOut.putText("CPU is already running process " + _CPU.PCB.pid + ", process " + pid + " added to Ready Queue.");
                    // Update Ready Queue through Kernel
                    _Schedular.addReadyQueue(pcb);
                }
                else {
                    _StdOut.putText("Running process " + pid + ".");
                    // Update CPU State through Kernel
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, pcb));
                }
            }
            else {
                _StdOut.putText("Usage: run <pid> Please provide a pid.");
            }
        };
        Shell.prototype.shellRunAll = function (args) {
            // Create List of all processes not terminate or running
            var residentProcesses = _ResidentList.filter(function (element) { return element.state == "resident"; });
            // Add all Resident Processes to our ReadyQueue
            if (residentProcesses.length > 0) {
                for (var _i = 0, residentProcesses_1 = residentProcesses; _i < residentProcesses_1.length; _i++) {
                    var process = residentProcesses_1[_i];
                    if (_ReadyQueue.indexOf(process) == -1) {
                        _Schedular.addReadyQueue(process);
                    }
                }
                // Check current schedule for Priority
                console.log("Current Alg: " + _Schedular.currentAlgorithm);
                if (_Schedular.currentAlgorithm == "p") {
                    // Filter accordingly
                    _ReadyQueue.sort(function (a, b) { return (a.priority > b.priority) ? 1 : -1; });
                }
                // Check if CPU needs to be assigned Process
                if (!_CPU.isExecuting && !_CPU.PCB) {
                    _StdOut.putText("Running process " + _ReadyQueue[0].pid + ".");
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, _ReadyQueue[0]));
                }
                else if (_CPU.PCB.state == "terminated") {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, null));
                }
            }
            else {
                _StdOut.putText("No processes in main memory to execute.");
                _StdOut.advanceLine();
            }
        };
        Shell.prototype.shellPs = function (args) {
            if (_ResidentList.length > 0) {
                for (var i = 0; i < _ResidentList.length; i++) {
                    _StdOut.putText("  Process PID: " + _ResidentList[i].pid + " / State: " + _ResidentList[i].state);
                    _StdOut.advanceLine();
                }
            }
            else {
                _StdOut.putText("No processes are currently in main memory.");
            }
        };
        Shell.prototype.shellClear = function (args) {
            if (args.length > 0) {
                var segment = void 0;
                var pcb_1;
                // Validate index of Arg
                out: for (var _i = 0, _a = _MemoryManager.memoryRegisters; _i < _a.length; _i++) {
                    var seg = _a[_i];
                    if (seg.index == args[0]) {
                        segment = seg;
                        break out;
                    }
                }
                // Validate Segment
                if (segment != undefined) {
                    // Find if Memory Segment contains Process
                    for (var _b = 0, _ResidentList_2 = _ResidentList; _b < _ResidentList_2.length; _b++) {
                        var process = _ResidentList_2[_b];
                        if (process.segment.index == segment.index) {
                            pcb_1 = process;
                        }
                    }
                    if (pcb_1 != undefined) {
                        if (pcb_1.state != "terminated" && pcb_1.state != "running") {
                            _MemoryAccessor.clear(pcb_1.segment);
                            _StdOut.putText("Process " + pcb_1.pid + " in segment " + segment.index + " has been cleared from memory.");
                        }
                        else {
                            if (pcb_1.state == "running") {
                                var params = [pcb_1, true];
                                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, params));
                                _MemoryAccessor.clear(pcb_1.segment);
                                _StdOut.putText("Process " + pcb_1.pid + " in segment " + segment.index + " has been cleared from memory.");
                            }
                            else {
                                _MemoryAccessor.clear(pcb_1.segment);
                                _StdOut.putText("Process " + pcb_1.pid + " is already terminated.");
                                _StdOut.advanceLine();
                                _StdOut.putText("Process " + pcb_1.pid + " in segment " + segment.index + " has been cleared from memory.");
                            }
                        }
                        // Update Resident List
                        _ResidentList = _ResidentList.filter(function (element) { return element.pid != pcb_1.pid; });
                    }
                    else if (segment.isFilled) {
                        _StdOut.putText("Memory segment " + segment.index + " has been cleared.");
                        _MemoryAccessor.clear(segment);
                    }
                    else {
                        _StdOut.putText("Memory segment " + segment.index + " is already empty.");
                    }
                }
                else {
                    _StdOut.putText("Memory segment " + args[0] + " does not exist.");
                }
            }
            else {
                _StdOut.putText("Usage: clear <index> please provide a segment index.");
            }
        };
        Shell.prototype.shellClearmem = function (args) {
            // Iterate through Memory Segments
            for (var _i = 0, _a = _MemoryManager.memoryRegisters; _i < _a.length; _i++) {
                var segment = _a[_i];
                // Check Segment for containing process
                if (segment.isFilled) {
                    var _loop_1 = function (process) {
                        if (process.segment.index == segment.index) {
                            // Check if Process in Segment is running or terminated
                            if (process.state != "terminated" && process.state != "running") {
                                _MemoryAccessor.clear(process.segment);
                                _StdOut.putText("Process " + process.pid + " in segment " + segment.index + " has been cleared from memory.");
                                _StdOut.advanceLine();
                            }
                            else {
                                if (process.state == "running") {
                                    // Output User Prompt if clearing last segment
                                    if (process.state.index == 2) {
                                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, process));
                                    }
                                    else {
                                        params = [process, true];
                                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, params));
                                    }
                                    _MemoryAccessor.clear(process.segment);
                                    _StdOut.putText("Process " + process.pid + " in segment " + segment.index + " has been cleared from memory.");
                                    _StdOut.advanceLine();
                                }
                                else {
                                    _MemoryAccessor.clear(process.segment);
                                    _StdOut.putText("Process " + process.pid + " is already terminated.");
                                    _StdOut.advanceLine();
                                    _StdOut.putText("Process " + process.pid + " in segment " + segment.index + " has been cleared from memory.");
                                    _StdOut.advanceLine();
                                }
                            }
                            // Update Resident List
                            _ResidentList = _ResidentList.filter(function (element) { return element.pid != process.pid; });
                        }
                    };
                    var params;
                    // Find Respective Process within current segment
                    for (var _b = 0, _ResidentList_3 = _ResidentList; _b < _ResidentList_3.length; _b++) {
                        var process = _ResidentList_3[_b];
                        _loop_1(process);
                    }
                }
                else {
                    // Clear Current Memory Segment
                    //_MemoryAccessor.clear(segment);
                    _StdOut.putText("Segment " + segment.index + " is already empty.");
                    _StdOut.advanceLine();
                }
            }
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                var pcb = void 0;
                // Validate pid in our Resident List
                out: for (var _i = 0, _ResidentList_4 = _ResidentList; _i < _ResidentList_4.length; _i++) {
                    var process = _ResidentList_4[_i];
                    if (process.pid == args[0]) {
                        pcb = process;
                        break out;
                    }
                }
                // Update Console
                if (pcb != undefined) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, pcb));
                }
                else {
                    _StdOut.putText("Process " + args[0] + " does not exist.");
                }
            }
            else {
                _StdOut.putText("Usage: kill <pid> Please provide a pid.");
            }
        };
        Shell.prototype.shellKillAll = function (args) {
            var last = false;
            // Terminate all Proccesses Resident
            if (_ResidentList.length > 0) {
                for (var _i = 0, _ResidentList_5 = _ResidentList; _i < _ResidentList_5.length; _i++) {
                    var process = _ResidentList_5[_i];
                    if (process.state == "terminated") {
                        _StdOut.putText("Process " + process.pid + " is already terminated.");
                        _StdOut.advanceLine();
                        continue; // No need to send interrupt
                    }
                    else {
                        // Check if current process is last in ResidentList
                        if (!last) {
                            for (var i = 0; i < _ResidentList.length; i++) {
                                if (i != _ResidentList.indexOf(process)) {
                                    if (_ResidentList[i].state != "terminated") {
                                        last = false;
                                    }
                                    else {
                                        last = true;
                                    }
                                }
                            }
                        }
                        // Execute Terminate Interrupt
                        if (last) {
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, process));
                        }
                        else {
                            var params = [process, true];
                            // Hard State Update to process before next loop to prevent late Interrupt update
                            process.state = "terminated";
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, params));
                        }
                    }
                }
            }
            else {
                _StdOut.putText("Main Memory is currently empty.");
            }
        };
        Shell.prototype.shellGetSchedule = function (args) {
            _StdOut.putText("Current Scheduling Algorithm: " + _Schedular.currentAlgorithm + ".");
        };
        Shell.prototype.shellSetSchedule = function (args) {
            var valid = false;
            var algorithms = ["rr", "fcfs", "p"];
            if (args.length > 0) {
                for (var _i = 0, algorithms_1 = algorithms; _i < algorithms_1.length; _i++) {
                    var a = algorithms_1[_i];
                    if (args[0] == a) { // Correct format check
                        _Schedular.setAlgorithm(a);
                        valid = true;
                        _StdOut.putText("Scheduling algorithm set to: " + a + ".");
                    }
                }
                // Non-valid input
                if (!valid) {
                    _StdOut.putText("Please provide a valid input [rr, fcfs, p].");
                }
            }
            else {
                _StdOut.putText("Usage: setschedule <algorithm> please provide one [rr, fcfs, p].");
            }
        };
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                // If float round down... Prevents float case
                var num = Math.floor(Number(args[0]));
                // Verify value given is a number
                if (!isNaN(num)) {
                    if (num > 0) {
                        _Schedular.setQuantum(num);
                        _StdOut.putText("Quantum set to: " + num);
                    }
                    else {
                        _StdOut.putText("Quantum must be greater than 0.");
                    }
                }
                else {
                    _StdOut.putText("Given value " + args[0] + " is not a integer.");
                }
            }
            else {
                _StdOut.putText("Usage: quantum <int> please provide a integer.");
            }
        };
        Shell.prototype.shellFormat = function (args) {
            var params;
            // Check for Format Flag
            if (args.length > 0) {
                args[0] = args[0].toLowerCase();
                // Validate -full or -quick
                if (args[0].charAt(0) == "-") {
                    if (args[0].substring(1) == "quick") {
                        params = { 'action': 'format',
                            'flag': false };
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
                    }
                    else if (args[0].substring(1) == "full") {
                        params = { 'action': 'format',
                            'flag': true };
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
                    }
                    else {
                        _StdOut.putText("Please provide a valid flag [-quick, -full]");
                    }
                }
                else {
                    _StdOut.putText("Please provide a valid flag [-quick, -full]");
                }
            }
            else {
                // No Args given format Disk as full
                params = { 'action': 'format',
                    'flag': true };
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
        };
        Shell.prototype.shellCreate = function (args) {
            var params;
            // Validate filename given
            if (args.length > 0) {
                params = { 'action': 'create',
                    'name': args[0],
                    'flag': undefined };
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
            else {
                _StdOut.putText("Usage: create <filename> please provide a file name.");
            }
        };
        Shell.prototype.shellWrite = function (args) {
            var params;
            // Validate filename + data
            if (args.length >= 2) {
                // Combine all elements after filename
                var data = [];
                for (var i = 1; i < args.length; i++) {
                    data.push(args[i]);
                }
                params = { 'action': 'write',
                    'name': args[0],
                    'data': data.join(' ') };
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
            else {
                _StdOut.putText('Usage: write <filename> "data" please provide both a file name and data to write');
            }
        };
        Shell.prototype.shellRead = function (args) {
            var params;
            // Validate filename
            if (args.length > 0) {
                params = { 'action': 'read',
                    'name': args[0] };
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
            else {
                _StdOut.putText("Usage: read <filename> please provide a file name.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
