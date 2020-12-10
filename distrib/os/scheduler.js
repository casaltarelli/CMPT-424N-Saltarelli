/* ------------
     Dispatcher.ts

     The Dispatcher controls allocatiing our CPU to the respective process that has been determined by our schedular.

     Note: It's pretty cool how much power this little guy has
------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(currentProcess, currentAlgorithm, // Default to Round Robins
        availableAlgorithms, quantum, cycles) {
            if (currentProcess === void 0) { currentProcess = null; }
            if (currentAlgorithm === void 0) { currentAlgorithm = "rr"; }
            if (availableAlgorithms === void 0) { availableAlgorithms = {
                rr: "round robin",
                fcfs: "first come, first serve",
                priority: "priority"
            }; }
            if (quantum === void 0) { quantum = 6; }
            if (cycles === void 0) { cycles = 0; }
            this.currentProcess = currentProcess;
            this.currentAlgorithm = currentAlgorithm;
            this.availableAlgorithms = availableAlgorithms;
            this.quantum = quantum;
            this.cycles = cycles;
        }
        /**
         * setAlgorithm(alg)
         * - Allows User to choose
         *   CPU Scheduling Algorithm
         */
        Scheduler.prototype.setAlgorithm = function (alg) {
            // Update Schedular acordingly
            // TODO: Consider idea of comparing through for-loop, maybe easier to add future algs
            switch (alg) {
                case ("rr"):
                    this.quantum = 6; // Default
                    this.currentAlgorithm = alg;
                    break;
                case ("fcfs"):
                    this.quantum = Infinity;
                    this.currentAlgorithm = alg;
                    break;
                case ("p"):
                    this.currentAlgorithm = alg;
                    break;
            }
        };
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
            // Check current algorithm for first schedule
            if (this.currentAlgorithm != "p") {
                out: for (var _i = 0, _ReadyQueue_1 = _ReadyQueue; _i < _ReadyQueue_1.length; _i++) {
                    var process = _ReadyQueue_1[_i];
                    if (process.state == "running") {
                        this.currentProcess = process;
                        break out;
                    }
                }
            }
            else {
                // Filter ReadQueue for Priority
                _ReadyQueue.sort(function (a, b) { return (a.priority > b.priority) ? 1 : -1; });
                // Assign Highest Priority Process
                this.currentProcess = _ReadyQueue[0];
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
         * priority()
         * - Schedules processes in
         *   main memory through priority
         */
        Scheduler.prototype.priority = function () {
            // Update our ReadyQueue
            _ReadyQueue.sort(function (a, b) { return (a.priority > b.priority) ? 1 : -1; });
            // Assign new process if least priority process is not already running
            if (_ReadyQueue[0].pid != this.currentProcess.pid) {
                this.assignProcess(_ReadyQueue[0]);
            }
        };
        /**
         * update()
         * - Updates process statistics
         *   and CPU scheduling
         */
        Scheduler.prototype.update = function () {
            // Update Schedular based on current algorithm
            switch (this.currentAlgorithm) {
                case ("rr"):
                    _Kernel.krnTrace("Scheduling with round robin.");
                    this.roundRobin();
                    break;
                case ("fcfs"):
                    _Kernel.krnTrace("Scheduling with first come, first serve.");
                    this.roundRobin();
                    break;
                case ("p"):
                    _Kernel.krnTrace("Scheduling with priority.");
                    this.priority();
                    break;
            }
            // Update Turnaround + WaitTime for ea Process
            for (var _i = 0, _ResidentList_1 = _ResidentList; _i < _ResidentList_1.length; _i++) {
                var process = _ResidentList_1[_i];
                if (_CPU.PCB == process) {
                    process.turnaroundTime++;
                }
                if (process.state == "ready") {
                    process.waitTime++;
                }
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
