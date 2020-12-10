/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public nameStr = "User";
        public statusStr = "";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {}

        public init() {
            var sc: ShellCommand;
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                   "date",
                                   "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;

            // whereAmI
            sc = new ShellCommand(this.shellWhereAmI,
                                    "whereami",
                                    "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;

            // setname <string>
            sc = new ShellCommand(this.shellSetName,
                                    "setname",
                                    "- Sets username.");
            this.commandList[this.commandList.length] = sc;

            // name 
            sc = new ShellCommand(this.shellName,
                                    "name",
                                    "- Displays username.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                                    "status",
                                    "- <string> Updates User Status.");
            this.commandList[this.commandList.length] = sc;

            // death
            sc = new ShellCommand(this.shellDeath,
                                    "death",
                                    "- death Displays BSOD Message for OS errors.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                                    "load",
                                    "- load validates user code and uploads to main memory.");
            this.commandList[this.commandList.length] = sc;

            // run <pid> 
            sc = new ShellCommand(this.shellRun,
                                    "run",
                                    " - <pid> run executes a process by a specified pid.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                                    "runall",
                                    " - executes all process in main memory at once.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPs,
                                    "ps",
                                    " - displays all processes in main memory.");
            this.commandList[this.commandList.length] = sc;

            // clear <pid>
            sc = new ShellCommand(this.shellClear,
                                    "clear",
                                    " - clears a specified segment of memory from a given index.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearmem,
                                    "clearmem",
                                    " - clears all segments of main memory.");
            this.commandList[this.commandList.length] = sc;

            // kill <pid> 
            sc = new ShellCommand(this.shellKill,
                                    "kill",
                                    " - <pid> kill terminates a process in main memory.");
            this.commandList[this.commandList.length] = sc;

            // killall
            sc = new ShellCommand(this.shellKillAll,
                                    "killall",
                                    " - killall terminates all processes in main memory.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                                    "getschedule",
                                    " - getschedule returns the current scheduling algorithm");
            this.commandList[this.commandList.length] = sc;
            
            // setschedule [rr, fcfs, p]
            sc = new ShellCommand(this.shellSetSchedule,
                                    "setschedule",
                                    " - setschedule sets the current scheduling algorithm for the CPU");
            this.commandList[this.commandList.length] = sc;

            // quantum <int>
            sc = new ShellCommand(this.shellQuantum,
                                    "quantum",
                                    " - <int> set the quantum value for the CPU Schedular.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormat,
                                    "format",
                                    " - format initilizes the Disk definition for our File System.");
            this.commandList[this.commandList.length] = sc;

            // create
            sc = new ShellCommand(this.shellCreate,
                                    "create",
                                    " - <filename> create a file with a provided name.");
            this.commandList[this.commandList.length] = sc;

            // write
            sc = new ShellCommand(this.shellWrite,
                                    "write",
                                    ' - <filename> "data" writes data to file with a provided name.');
            this.commandList[this.commandList.length] = sc;

            // read
            sc = new ShellCommand(this.shellRead,
                                    "read",
                                    " - <filename> reads a file with a provided name.");
            this.commandList[this.commandList.length] = sc;

            // delete
            sc = new ShellCommand(this.shellDelete,
                                    "delete",
                                    " - <filename> deletes a file with a provided name.");
            this.commandList[this.commandList.length] = sc;

            // list
            sc = new ShellCommand(this.shellList,
                                    "ls",
                                    " - list will list all files currently stored on our Hard Drive.");
            this.commandList[this.commandList.length] = sc;

            // copy
            sc = new ShellCommand(this.shellCopy,
                                    "copy",
                                    " - <filename> creates a duplicate of the given file name.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial  prompt.
            this.putName();
            this.putPrompt();
        }

        public putName() {
            _StdOut.putText(this.nameStr);
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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
            setTimeout(function(){
                if (_Console.currentXPosition > 0) {
                    _StdOut.advanceLine();
                }

                // Display Prompt
                _OsShell.putName();
                _OsShell.putPrompt();
            }, 100); 
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                var found: boolean = false;

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
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {
            // Declare Date Object + Output
            var d = new Date(); 
            _StdOut.putText("Today's Date: " + d);
        }

        public shellWhereAmI(args: string[]) {
            // Display Users Location
            _StdOut.putText("5th & Chestnut");
        }

        public shellSetName(args: string[]) {
            // Update Username
            if (args.length > 0) {
                _OsShell.nameStr = args[0];
            } else {
                _StdOut.putText("Usage: name <string>  Please give a name.");
            }
        }

        public shellName(args: string[]) {
            // Display Users set username
            _StdOut.putText(_OsShell.nameStr);
        }

        public shellStatus(args: string[]) {
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

            } else {
                _StdOut.putText("Usage: status <string> Please provide a status");
            }
        }

        public shellDeath(args: string[]) {
            // Display BSOD
            var canvas = document.getElementById("display");
            canvas.style.backgroundColor = "blue";

            // Clear Canvas
            _StdOut.clearScreen();     
            _StdOut.resetXY();

            _StdOut.putText("FATAL ERROR: Shutting down...");
            _Kernel.krnTrapError("Kernal death");
            _Kernel.krnShutdown();
        }

        public shellLoad(args: string[]) {
            // Get Textarea Content
            var userInput = (<HTMLInputElement>document.getElementById("taProgramInput")).value;

            // Remove White Space
            userInput = userInput.replace(/\s/g, "");

            // Validate Input via RegEx + Output to Canvas
            let regex = /^[A-Fa-f0-9]+$/;

            // Check for priority otherwise assign default
            let priority;
            if (parseInt(args[0]) > 0) {
                priority = parseInt(args[0]);
            } else {
                priority = 10; // Default Priority
            }

            if (regex.test(userInput)) {
                let input = userInput.match(/.{2}/g);
                let pcb = _MemoryManager.load(input);

                // Test Load Success
                if (pcb) {
                    // Add Priority to pcb
                    pcb.priority = priority;

                    if (pcb.location == "memory") {
                        let segment;
                        segment = pcb.segment;

                        _StdOut.putText("Program with PID " + pcb.pid + " loaded into memory segment " + segment.index + ".");
                    } else {
                        _StdOut.putText("Program with PID " + pcb.pid + " loaded into Hard Drive Disk.");
                    }
                    
                } else {
                    _StdOut.putText("Memory is full. Please clear before loading new process.");
                }

            } else {
                _StdOut.putText("Hex Code could not be validated. Please try again.");
            }
        }

        public shellRun(args: string[]) {
            if (args.length > 0) {
                // Get Process PCB
                let pid = parseInt(args[0]);
                let pcb;

                // Find Process within ReadyQueue
                for (let process of _ResidentList) {
                    if (process.pid == pid) {
                        pcb = process;
                    }
                }

                // Update Console
                if (!pcb) {
                    _StdOut.putText("Process " + pid + " does not exist.");
                } else if (pcb.state === "running") {
                    _StdOut.putText("Process " + pid + " is already running.");
                } else if (pcb.state === "terminated") {
                    _StdOut.putText("Process " + pid + " had already ran and has been terminated.");
                } else if (_CPU.PCB && _CPU.isExecuting == true) {
                    _StdOut.putText("CPU is already running process " + _CPU.PCB.pid + ", process " + pid + " added to Ready Queue.");

                    // Update Ready Queue through Kernel
                    _Schedular.addReadyQueue(pcb);
                } else {
                    _StdOut.putText("Running process " + pid + ".");

                    // Update CPU State through Kernel
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, pcb));
                }
            } else {
                _StdOut.putText("Usage: run <pid> Please provide a pid.");
            }
        }

        public shellRunAll(args: string[]) {
            // Create List of all processes not terminate or running
            let residentProcesses = _ResidentList.filter(element => element.state == "resident");

            // Add all Resident Processes to our ReadyQueue
            if (residentProcesses.length > 0) {
                for (let process of residentProcesses) {
                    if (_ReadyQueue.indexOf(process) == -1) {
                        _Schedular.addReadyQueue(process);
                    }
                }

                if (_Schedular.currentAlgorithm == "p") {
                    // Filter accordingly
                    _ReadyQueue.sort((a, b) => (a.priority > b.priority) ? 1 : -1);
                }

                // Check if CPU needs to be assigned Process
                if (!_CPU.isExecuting && !_CPU.PCB) {
                    _StdOut.putText("Running process " + _ReadyQueue[0].pid + ".");
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, _ReadyQueue[0]));
                } else if (_CPU.PCB.state == "terminated") {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, null));
                }
            } else {
                _StdOut.putText("No processes in main memory to execute.");
                _StdOut.advanceLine();
            }
        }

        public shellPs(args: string[]) {
            if (_ResidentList.length > 0) {
                for (let i = 0; i < _ResidentList.length; i++) {
                    _StdOut.putText("  Process PID: " + _ResidentList[i].pid + " / State: " + _ResidentList[i].state);
                    _StdOut.advanceLine();
                }
            } else {
                _StdOut.putText("No processes are currently in main memory.");
            }   
        }

        public shellClear(args: string[]) {
            if (args.length > 0) {
                let segment;
                let pcb;
                
                // Validate index of Arg
                out:
                for (let seg of _MemoryManager.memoryRegisters) {
                    if (seg.index == args[0]) {
                        segment = seg;
                        break out;
                    }
                }

                // Validate Segment
                if (segment != undefined) {
                    // Find if Memory Segment contains Process
                    for (let process of _ResidentList) {
                        if (process.segment.index == segment.index) {
                            pcb = process;
                        }
                    }

                    if (pcb != undefined) {
                        if (pcb.state != "terminated" && pcb.state != "running") {
                            _MemoryAccessor.clear(pcb.segment);
                            _StdOut.putText("Process " + pcb.pid + " in segment " + segment.index + " has been cleared from memory.");

                        } else {
                            if (pcb.state == "running") {
                                var params = [pcb, true];
                                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, params));
                                _MemoryAccessor.clear(pcb.segment);

                                _StdOut.putText("Process " + pcb.pid + " in segment " + segment.index + " has been cleared from memory.");

                            } else {
                                _MemoryAccessor.clear(pcb.segment);
                                
                                _StdOut.putText("Process " + pcb.pid + " is already terminated.");
                                _StdOut.advanceLine();
                                _StdOut.putText("Process " + pcb.pid + " in segment " + segment.index + " has been cleared from memory.");
                            }
                        }

                        // Update Resident List
                        _ResidentList = _ResidentList.filter(element => element.pid != pcb.pid);
                    } else if (segment.isFilled) {
                        _StdOut.putText("Memory segment " + segment.index + " has been cleared.")
                        _MemoryAccessor.clear(segment);
                    } else {
                        _StdOut.putText("Memory segment " + segment.index + " is already empty.")
                    }
                } else {
                    _StdOut.putText("Memory segment " + args[0] + " does not exist.");
                }
            } else {
                _StdOut.putText("Usage: clear <index> please provide a segment index.");
            }
        }

        public shellClearmem(args: string[]) {
            // Iterate through Memory Segments
            for(let segment of _MemoryManager.memoryRegisters) {
                // Check Segment for containing process
                if (segment.isFilled) {
                    // Find Respective Process within current segment
                    for(let process of _ResidentList) {
                        if (process.segment.index == segment.index) {
                            // Check if Process in Segment is running or terminated
                            if (process.state != "terminated" && process.state != "running") {
                                _MemoryAccessor.clear(process.segment);
                                _StdOut.putText("Process " + process.pid + " in segment " + segment.index + " has been cleared from memory.");
                                _StdOut.advanceLine();
        
                            } else {
                                if (process.state == "running") {
                                    // Output User Prompt if clearing last segment
                                    if (process.state.index == 2) {
                                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, process));    
                                    } else {
                                        var params = [process, true];
                                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, params));
                                    }
                                    _MemoryAccessor.clear(process.segment);
        
                                    _StdOut.putText("Process " + process.pid + " in segment " + segment.index + " has been cleared from memory.");
                                    _StdOut.advanceLine();
        
                                } else {
                                    _MemoryAccessor.clear(process.segment);
                                    
                                    _StdOut.putText("Process " + process.pid + " is already terminated.");
                                    _StdOut.advanceLine();
                                    _StdOut.putText("Process " + process.pid + " in segment " + segment.index + " has been cleared from memory.");
                                    _StdOut.advanceLine();
                                }
                            }

                            // Update Resident List
                            _ResidentList = _ResidentList.filter(element => element.pid != process.pid);
                        } 
                    }
                } else {
                    // Clear Current Memory Segment
                    //_MemoryAccessor.clear(segment);
                    _StdOut.putText("Segment " + segment.index + " is already empty.");
                    _StdOut.advanceLine();
                }
                
            }
        }

        public shellKill(args: string[]) {
            if (args.length > 0) {
                let pcb;
                
                // Validate pid in our Resident List
                out:
                for (let process of _ResidentList) {
                    if (process.pid == args[0]) {
                        pcb = process;
                        break out;
                    }
                }

                // Update Console
                if (pcb != undefined) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, pcb));
                } else {
                    _StdOut.putText("Process " + args[0] + " does not exist.");
                }
            } else {
                _StdOut.putText("Usage: kill <pid> Please provide a pid.");
            } 
        }

        public shellKillAll(args: string[]) {
            let last = false;
            // Terminate all Proccesses Resident
            if (_ResidentList.length > 0) {
                for (let process of _ResidentList) {
                    if (process.state == "terminated") {
                        _StdOut.putText("Process " + process.pid + " is already terminated.");
                        _StdOut.advanceLine();
                        continue;   // No need to send interrupt
                    } else {
                        // Check if current process is last in ResidentList
                        if (!last) {
                            for (let i = 0; i < _ResidentList.length; i++) {
                                if (i != _ResidentList.indexOf(process)) {
                                    if (_ResidentList[i].state != "terminated") {
                                        last = false;
                                    } else {
                                        last = true;
                                    }
                                }
                            }
                        }
    
                        // Execute Terminate Interrupt
                        if (last) {
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, process));    
                        } else {
                            var params = [process, true];
    
                            // Hard State Update to process before next loop to prevent late Interrupt update
                            process.state = "terminated"; 
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, params));
                        }
                    }
                }
            } else {
                _StdOut.putText("Main Memory is currently empty.");
            }
        }
        public shellGetSchedule(args: string[]) {
            _StdOut.putText("Current Scheduling Algorithm: " + _Schedular.currentAlgorithm + ".");
        }

        public shellSetSchedule(args: string[]) {
            var valid = false;
            var algorithms = ["rr", "fcfs", "p"];

            if (args.length > 0) {
                for (let a of algorithms) {
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
            } else {
                _StdOut.putText("Usage: setschedule <algorithm> please provide one [rr, fcfs, p].");
            }
        }

        public shellQuantum(args: string[]) {
            if (args.length > 0) {
                // If float round down... Prevents float case
                let num = Math.floor(Number(args[0]));

                // Verify value given is a number
                if (!isNaN(num)) {
                    if (num > 0) {
                        _Schedular.setQuantum(num);
                        _StdOut.putText("Quantum set to: " + num);
                    } else {
                        _StdOut.putText("Quantum must be greater than 0.");
                    }
                } else {
                    _StdOut.putText("Given value " + args[0] + " is not a integer.");
                }
                
            } else {
                _StdOut.putText("Usage: quantum <int> please provide a integer.");
            }
        }

        public shellFormat(args: string[]) {
            let params;

            // Check for Format Flag
            if (args.length > 0) {
                args[0] = args[0].toLowerCase();

                // Validate -full or -quick
                if (args[0].charAt(0) == "-") {
                    if (args[0].substring(1) == "quick") {
                        params = {'action': 'format',
                                'flag': false};

                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));

                    } else if (args[0].substring(1) == "full") {
                        params = {'action': 'format',
                                'flag': true}; 
                        
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
                    } else {
                        _StdOut.putText("Please provide a valid flag [-quick, -full]");    
                    } 
                } else {
                    _StdOut.putText("Please provide a valid flag [-quick, -full]");
                }
            } else {
                // No Args given format Disk as full
                params = {'action': 'format',
                        'flag': true}; 

                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
        }

        public shellCreate(args: string[]) {
            let params;

            // Check filename given
            if (args.length > 0) {
                // Validate File Name
                if (args[0].indexOf('.') < 1) {
                    params = {'action': 'create',
                    'name': args[0]};
                
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
                } else {
                    _StdOut.putText("File name: " + name + " prohibited, cannot contain period in filename. Only at start.");
                }

            } else {
                _StdOut.putText("Usage: create <filename> please provide a file name.")
            }
        }

        public shellCopy(args: string[]) {
            let params;

            // Check filename given
            if (args.length > 0) {
                params = {'action': 'copy',
                    'name': args[0],
                    'flag': true}

                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            } else {
                _StdOut.putText("Usage: copy <filename> please provide a file name.")
            }
        }

        public shellWrite(args: string[]) {
            let params;

            // Validate filename + data
            if (args.length >= 2) {
                // Check for Quotation Markers
                if (args[1].indexOf('"') == 0 && args[args.length -1].indexOf('"') == args[args.length -1].length - 1) {
                    // Remove Markers
                    args[1] = args[1].substring(1);
                    args[args.length -1] = args[args.length -1].substring(0, args[args.length - 1].length -1);

                    // Combine Data into single array
                    let data = [];
                    for (let i = 1; i < args.length; i++) {
                        data.push(args[i]);
                    }

                    params = {'action': 'write',
                        'name': args[0],
                        'data': data.join(' ')};

                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
                } else {
                    _StdOut.putText('Please encase data in quotation marks [e.g "data"].');
                }
            } else {
                _StdOut.putText('Usage: write <filename> "data" please provide both a file name and data to write');
            }
        }

        public shellRead(args: string[]) {
            let params;

            // Validate filename
            if (args.length > 0) {
                params = {'action': 'read',
                    'name': args[0]};

                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            } else {
                _StdOut.putText("Usage: read <filename> please provide a file name.");
            }
        }

        public shellDelete(args: string[]) {
            let params;
            
            // Validate filename
            if (args.length > 0) {
                params = {'action': 'delete',
                    'name': args[0]};

                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params)); 
            } else {
                _StdOut.putText("Usage: delete <filename> please provide a file name.");
            }
        }

        public shellList(args: string[]) {
            let params; 

            // Check for Hidden File Flag
            if (args.length > 0) {
                args[0] = args[0].toLowerCase();

                // Check if correct flag given
                if (args[0].charAt(0) == "-") {
                    if (args[0].substring(1) == "l") {
                        params = {'action': 'list',
                                'flag': true};

                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));

                    } else {
                        _StdOut.putText("Please provide a valid flag [-l].");    
                    } 
                } else {
                    _StdOut.putText("Please provide a valid flag [-l].");
                }
            } else {
                // No Args given list as normal
                params = {'action': 'list',
                                'flag': false};

                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILE_SYSTEM_IRQ, params));
            }
        }
    }
}
