/* ------------
     Dispatcher.ts

     The Dispatcher controls allocatiing our CPU to the respective process that has been determined by our schedular.

     Note: It's pretty cool how much power this little guy has
------------ */

    module TSOS {
        export class Dispatcher { 
            constructor() {}

            /**
             * runProcess(PCB)
             * - Updates our CPU PCB reference
             *   to be executed on the next cycle
             */
            public runProcess(pcb) {
                // Update State of current Process -- if there is one
                if (_CPU.PCB && _CPU.PCB.state != "terminated") {
                    _CPU.PCB.state = "ready";
                }

                // Update new Process + Context Switch
                _ReadyQueue.push(pcb);
                pcb.state = "running";

                _PCB = pcb;
                _CPU.updateState(pcb);
                _CPU.isExecuting = true;
            }
        }
    }