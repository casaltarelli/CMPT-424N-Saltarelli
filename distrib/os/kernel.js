/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = /** @class */ (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            // Load the File System Device Driver
            this.krnTrace("Loading they disk device driver.");
            _krnDiskDriver = new TSOS.DeviceDriverDisk(); // Construct it.
            _krnDiskDriver.driverEntry(); // Call driverEntry() initialization routine.
            this.krnTrace(_krnDiskDriver.status);
            // Initialize Memory Manager
            _MemoryManager = new TSOS.MemoryManager();
            _MemoryManager.init();
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            // TODO: Implement Terminate on any running process
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.
            */
            // Save CPU State + Update Memory
            _CPU.saveState();
            TSOS.Control.updateMemoryDisplay();
            TSOS.Control.updateProcessDisplay();
            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                if (_Step) {
                    if (_NextStep) {
                        _CPU.cycle();
                        _Schedular.update();
                        _NextStep = false;
                    }
                }
                else {
                    _Schedular.update();
                    _CPU.cycle();
                }
                TSOS.Control.updateCPUDisplay();
            }
            else { // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        };
        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    if (params.length == 1) {
                        _krnKeyboardDriver.isr(params[0]);
                    }
                    else {
                        _krnKeyboardDriver.isr(params[0], params[1], params[2]);
                    }
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case FILE_SYSTEM_IRQ:
                    _krnDiskDriver.isr(params);
                    break;
                case RUN_CURRENT_PROCESS_IRQ:
                    _Dispatcher.runProcess(params);
                    break;
                case TERMINATE_PROCESS_IRQ:
                    if (Array.isArray(params)) {
                        this.krnTerminateProcess(params[0], params[1]);
                    }
                    else {
                        this.krnTerminateProcess(params);
                    }
                    break;
                case PRINT_YREGISTER_IRQ:
                    _StdOut.putText(_CPU.Yreg.toString());
                    break;
                case PRINT_FROM_MEMORY_IRQ:
                    var output = "";
                    var address = _CPU.Yreg;
                    var val = parseInt(_MemoryAccessor.read(_CPU.PCB.segment, address), 16);
                    while (val != 0) {
                        // Only add valid chars
                        if (String.fromCharCode(val) != undefined) {
                            // Get Char
                            output += String.fromCharCode(val);
                            // Update val to next
                            val = parseInt(_MemoryAccessor.read(_CPU.PCB.segment, ++address), 16);
                        }
                    }
                    // Check Null (Char Code Error)
                    if (output != null) {
                        _StdOut.putText(output);
                    }
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        };
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _OsShell.shellDeath;
            this.krnShutdown();
        };
        Kernel.prototype.krnTerminateProcess = function (process, killall) {
            // Check for Current Process
            if (_CPU.PCB && _CPU.PCB.pid == process.pid) {
                // Update State + Status
                _CPU.PCB.state = "terminated";
                _CPU.saveState();
                _CPU.isExecuting = false;
            }
            else {
                // Update Process State
                for (var _i = 0, _ResidentList_1 = _ResidentList; _i < _ResidentList_1.length; _i++) {
                    var p = _ResidentList_1[_i];
                    if (p.pid == process.pid) {
                        p.state = "terminated";
                    }
                }
            }
            // Remove from our Ready Queue
            _ReadyQueue = _ReadyQueue.filter(function (element) { return element.pid != process.pid; });
            // Update Schedular
            if (_ReadyQueue.length > 0) {
                _Schedular.assignProcess(_ReadyQueue[0]);
            }
            // Update Console
            _StdOut.advanceLine();
            _StdOut.putText("Process " + process.pid + " terminated.");
            // Output Wait Time + Turnaround Time for process in our kernel
            this.krnTrace("Process " + process.pid + " terminated. Wait Time: " + process.waitTime + "s Turnaround Time: " + process.turnaroundTime + "s");
            // Check if Killall Command
            if (!killall) {
                // Display Prompt
                _StdOut.advanceLine();
                _OsShell.putName();
                _OsShell.putPrompt();
            }
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
