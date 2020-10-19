/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();             // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Initialize Memory Manager
            _MemoryManager = new MemoryManager();
            _MemoryManager.init();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                          
            */
           
            // Save CPU State + Update Memory
            _CPU.saveState();
            Control.updateMemoryDisplay();
            Control.updateProcessDisplay();

            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                if (_Step) {
                    if (_NextStep) {
                        _CPU.cycle();  
                        _NextStep = false; 
                    }
                } else {
                    _CPU.cycle();
                }

                // Update CPU + PCB Display
                Control.updateCPUDisplay();

            } else {                       // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                    break;

                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;

                case RUN_CURRENT_PROCESS_IRQ:
                    if (!_CPU.PCB && _CPU.isExecuting == false) {
                        _Dispatcher.runProcess(params);
                    } else {
                        // Add Process to Ready Queue if CPU is already executing
                        _ReadyQueue.push(params);  
                    }
                    //TODO: Implement Dispatcher to update current PCB on CPU
                    // Context Switch Control + Terminate Control

                case TERMINATE_CURRENT_PROCESS_IRQ:
                    if (_CPU.PCB && _CPU.PCB.state != "terminate") {
                        _CPU.saveState();
                        this.krnTerminateProcess(_CPU.PCB.pid);
                    }
                    break;

                case TERMINATE_PROCESS_IRQ:
                    this.krnTerminateProcess(params[0]);
                    break;

                case PRINT_YREGISTER_IRQ:
                    _StdOut.putText(_CPU.Yreg.toString());
                    break;

                case PRINT_FROM_MEMORY_IRQ:
                    let output = "";

                    let address = _CPU.Yreg;
                    let val = parseInt(_MemoryAccessor.read(_CPU.PCB.segment, address), 16);

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
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }

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
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _OsShell.shellDeath;

            this.krnShutdown();
        }

        public krnTerminateProcess(process) {
            // Check for Current Process
            if (_CPU.PCB.pid == process.pid) {
                // Update State + Status
                _CPU.PCB.state = "terminated";
                _CPU.saveState();
                _CPU.isExecuting = false;
            } else {
                // Update Process State
                for (let p of _ResidentList) {
                    if (p.pid == process.pid) {
                        p.state = "terminated";
                    }
                }
            }
            
            // Remove from our ResidentList + Ready Queue
            _ResidentList = _ResidentList.filter(element => element.pid != process.pid);
            _ReadyQueue = _ReadyQueue.filter(element => element.pid != process.pid);

            // Clear Memory Segment
            _MemoryAccessor.clear(process.segment);
            
            // Update Console
            _StdOut.advanceLine();
            _StdOut.putText("Process " + process.pid + " terminated.");

            // Display Prompt
            _StdOut.advanceLine();
            _OsShell.putName();
            _OsShell.putPrompt();
        }
    }
}
