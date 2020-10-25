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
         * addReadyQueue(pcb)
         * - Allows us to add a 
         *   process to our Ready Queue
         */
        public addReadyQueue(pcb) {
            _ReadyQueue.push(pcb);
        }

        /**
         * runProcess(pcb)
         * - Calls our dispatcher
         *   to run a specified process
         */
        public runProcess() {
            // Check if given process is running on CPU currently
            if (!this.currentProcess || this.currentProcess.pid != _ReadyQueue[0].pid) {
                // Perform context switch through dispatcher
                _Kernel.krnTrace("Performing context switch");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, _ReadyQueue[0]))
            }
        }

        /**
         * roundRobin()
         * - Schedules processes in main
         *   memory through round robin
         */
        public roundRobin() {
            //TODO: Breakdown Round Robin Scheduling + Implement Statistics to trackk cycles    
        }

        
    }
}