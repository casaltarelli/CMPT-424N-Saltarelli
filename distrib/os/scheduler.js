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
         * addReadyQueue(pcb)
         * - Allows us to add a
         *   process to our Ready Queue
         */
        Scheduler.prototype.addReadyQueue = function (pcb) {
            _ReadyQueue.push(pcb);
        };
        /**
         * runProcess(pcb)
         * - Calls our dispatcher
         *   to run a specified process
         */
        Scheduler.prototype.runProcess = function () {
            // Check if given process is running on CPU currently
            if (!this.currentProcess || this.currentProcess.pid != _ReadyQueue[0].pid) {
                // Perform context switch through dispatcher
                _Kernel.krnTrace("Performing context switch");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, _ReadyQueue[0]));
            }
        };
        /**
         * roundRobin()
         * - Schedules processes in main
         *   memory through round robin
         */
        Scheduler.prototype.roundRobin = function () {
            //TODO: Breakdown Round Robin Scheduling + Implement Statistics to trackk cycles    
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
