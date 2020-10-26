/* ------------
     Dispatcher.ts

     The Dispatcher controls allocatiing our CPU to the respective process that has been determined by our schedular.

     Note: It's pretty cool how much power this little guy has
------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(currentProcess, quantum, cycles) {
            if (currentProcess === void 0) { currentProcess = null; }
            if (quantum === void 0) { quantum = 6; }
            if (cycles === void 0) { cycles = 0; }
            this.currentProcess = currentProcess;
            this.quantum = quantum;
            this.cycles = cycles;
        }
        /**
         * setQuantum(n)
         *  - Allows User to set
         *  quantum level
         */
        Scheduler.prototype.setQuantum = function (n) {
            this.quantum = n;
        };
        /**
         * addReadyQueue(pcb)
         * - Allows us to add a
         *   process to our Ready Queue
         */
        Scheduler.prototype.addReadyQueue = function (pcb) {
            pcb.state = "ready";
            _ReadyQueue.push(pcb);
        };
        /**
         * assignProcess(pcb)
         * - Calls our dispatcher
         *   to run a specified process
         */
        Scheduler.prototype.assignProcess = function (process) {
            // Check if given process is running on CPU currently
            if (!this.currentProcess || this.currentProcess.pid != _ReadyQueue[0].pid) {
                // Perform context switch through interrupt to dispatcher
                _Kernel.krnTrace("Performing context switch");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, process));
            }
        };
        /**
         * scheduleProcess()
         * - Updates currentProcess
         */
        Scheduler.prototype.scheduleProcess = function () {
            out: for (var _i = 0, _ReadyQueue_1 = _ReadyQueue; _i < _ReadyQueue_1.length; _i++) {
                var process = _ReadyQueue_1[_i];
                if (process.state == "running") {
                    this.currentProcess = process;
                    break out;
                }
            }
        };
        /**
         * roundRobin()
         * - Schedules processes in main
         *   memory through round robin
         */
        Scheduler.prototype.roundRobin = function () {
            // Validate Current Process
            if (this.currentProcess && _ReadyQueue.length > 0 && this.currentProcess.pid == _ReadyQueue[0].pid) {
                if (this.cycles < this.quantum) {
                    // Update Cycles  
                    this.cycles++;
                }
                else {
                    // Move Current Process to end of our Ready Queue
                    var old = _ReadyQueue.shift();
                    _ReadyQueue.push(old);
                    // Reset Cycles
                    this.cycles = 0;
                    // Run next process
                    this.assignProcess(_ReadyQueue[0]);
                }
            }
        };
        /**
         * update()
         * - Updates process statistics
         */
        Scheduler.prototype.update = function () {
            // Update Round Robin
            this.roundRobin();
            // Update Turnaround + WaitTime for ea Process
            for (var _i = 0, _ResidentList_1 = _ResidentList; _i < _ResidentList_1.length; _i++) {
                var process = _ResidentList_1[_i];
                if (_CPU.PCB == process) {
                    process.turnaroundTime++;
                    if (process.state == "ready") {
                        process.waitTime++;
                    }
                }
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
