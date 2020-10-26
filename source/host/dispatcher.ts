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
                // Check if PCB given is null... Find next available Process
                out:
                if (pcb == null && _ReadyQueue.length > 0) {
                    for (let process of _ReadyQueue) {
                        if (process.state == "ready") {
                            pcb = process;
                            break out;
                        }
                    }
                }

                // Update State of current Process -- if there is one
                if (_CPU.PCB && _CPU.PCB.state != "terminated") {
                    _CPU.PCB.state = "ready";
                } else if (_CPU.PCB && _CPU.PCB.state == "terminated") {
                    _ReadyQueue.filter(element => element != _CPU.PCB);
                }

                // Check if PCB is already in our Ready Queue (multiple run <pid> bug pervention)
                if (_ReadyQueue.indexOf(pcb) == -1) {
                    _ReadyQueue.push(pcb);
                }
                
                // Verify if given PCB is first process
                if (_ReadyQueue.indexOf(pcb) != 0) {
                    pcb.state = "ready";
                } else {
                    pcb.state = "running";
                    _Schedular.scheduleProcess();
                    _CPU.updateState(pcb);
                }
                
                _CPU.isExecuting = true;
            }
        }
    }