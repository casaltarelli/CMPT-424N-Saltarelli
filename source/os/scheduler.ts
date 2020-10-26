/* ------------
     Dispatcher.ts

     The Dispatcher controls allocatiing our CPU to the respective process that has been determined by our schedular.

     Note: It's pretty cool how much power this little guy has
------------ */

module TSOS {
    export class Scheduler {
        constructor(public currentProcess = null,
                    public quantum : number = 6,
                    public cycles : number = 0) {}

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
            out:
            for (let process of _ReadyQueue) {
                if (process.state == "running") {
                    this.currentProcess = process;
                    break out;
                }
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
         * update()
         * - Updates process statistics
         */
        public update() {
            // Update Round Robin
            this.roundRobin();
            
            // Update Turnaround + WaitTime for ea Process
            for (let process of _ResidentList) {
                if (_CPU.PCB == process) {
                    process.turnaroundTime++;
                    if (process.state == "ready") {
                        process.waitTime++;
                    }
                }
            }
        }
    }
}