/* ------------
     Dispatcher.ts

     The Dispatcher controls allocatiing our CPU to the respective process that has been determined by our schedular.

     Note: It's pretty cool how much power this little guy has
------------ */

module TSOS {
    export class Scheduler {
        constructor(public currentProcess = null,
                    public currentAlgorithm = "rr",     // Default to Round Robins
                    public availableAlgorithms = {
                        rr: "round robin",
                        fcfs: "first come, first serve",
                        priority: "priority"
                    },
                    public quantum : number = 6,
                    public cycles : number = 0) {}

        /**
         * setAlgorithm(alg)
         * - Allows User to choose
         *   CPU Scheduling Algorithm
         */
        public setAlgorithm(alg) {
            // Update Schedular acordingly
            // TODO: Consider idea of comparing through for-loop, maybe easier to add future algs
            switch(alg) {
                case("rr"):
                    this.quantum = 6; // Default
                    this.currentAlgorithm = alg;
                    break;
                
                case("fcfs"):
                    this.quantum = Infinity;
                    this.currentAlgorithm = alg;
                    break;

                case("p"):
                    this.currentAlgorithm = alg;
                    break;
            }
        }

        /**
         * setQuantum(n) 
         *  - Allows User to set
         *  quantum level
         */
        public setQuantum(n) {
            this.quantum = n;
        }

        /**
         * addReadyQueue(pcb)
         * - Allows us to add a 
         *   process to our Ready Queue
         */
        public addReadyQueue(pcb) {
            pcb.state = "ready";
            _ReadyQueue.push(pcb);
        }

        /**
         * assignProcess(pcb)
         * - Calls our dispatcher
         *   to run a specified process
         */
        public assignProcess(process) {
            // Check if given process is running on CPU currently
            if (!this.currentProcess || this.currentProcess.pid != _ReadyQueue[0].pid) {
                // Perform context switch through interrupt to dispatcher
                _Kernel.krnTrace("Performing context switch");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, process))
            }
        }

        /**
         * scheduleProcess()
         * - Updates currentProcess
         */
        public scheduleProcess() {
            // Check current algorithm for first schedule
            if (this.currentAlgorithm != "p") {
                out:
                for (let process of _ReadyQueue) {
                    if (process.state == "running") {
                        this.currentProcess = process;
                        break out;
                    }
                }
            } else {
                // Filter ReadQueue for Priority
                _ReadyQueue.sort((a, b) => (a.priority > b.priority) ? 1 : -1);

                // Assign Highest Priority Process
                this.currentProcess = _ReadyQueue[0];
            } 
        }

        /**
         * roundRobin()
         * - Schedules processes in main
         *   memory through round robin
         */
        public roundRobin() {
            // Validate Current Process
            if (this.currentProcess && _ReadyQueue.length > 0 && this.currentProcess.pid == _ReadyQueue[0].pid) {
                if (this.cycles < this.quantum) {
                    // Update Cycles  
                    this.cycles++   
                } else {
                    // Move Current Process to end of our Ready Queue
                    let old = _ReadyQueue.shift();
                    _ReadyQueue.push(old);

                    // Reset Cycles
                    this.cycles = 0;

                    // Run next process
                    this.assignProcess(_ReadyQueue[0]);
                }
            }
        }

        /**
         * priority()
         * - Schedules processes in 
         *   main memory through priority
         */
        public priority() {
            // Update our ReadyQueue
            _ReadyQueue.sort((a, b) => (a.priority > b.priority) ? 1 : -1);

            // Assign new process if least priority process is not already running
            if (_ReadyQueue[0].pid != this.currentProcess.pid) {
                this.assignProcess(_ReadyQueue[0]);
            }
        }

        /**
         * update()
         * - Updates process statistics
         *   and CPU scheduling
         */
        public update() {
            // Update Schedular based on current algorithm
            switch(this.currentAlgorithm) {
                case("rr"):
                    this.roundRobin();
                    break;
                
                case("fcfs"):
                    this.roundRobin();
                    break;

                case("p"):
                    this.priority();
                    break;
            }
            
            // Update Turnaround + WaitTime for ea Process
            for (let process of _ResidentList) {
                if (_CPU.PCB == process) {
                    process.turnaroundTime++;
                }

                if (process.state == "ready") {
                    process.waitTime++;
                }
            }
        }
    }
}