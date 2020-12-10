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

                    if (pcb.location == "drive") {
                        // Check Memory Segments for Potential Empty Segment
                        let segment;

                        out:
                        for (let i = 0; i < _MemoryManager.memoryRegisters.length; i++) {
                            if(_MemoryManager.memoryRegisters[i].isFilled == false) {
                                segment = i;
                                break out;  // Once found exit
                            }
                        }

                        if (segment == undefined) {
                            // Initiate Roll Out/ Roll In Routine - Part I
                            _Kernel.krnTrace("Rolling out process.");

                            console.log("######################################");
                            console.log("NEW ITERATION")


                            // Get All Process in Main Memory not running or terminated stored 
                            let victims = _ResidentList.filter((pcb) => { return pcb.location == "memory" && (pcb.state == "ready" || pcb.state == "resident")});

                            // Choose Process based on Scheduling Algorithm
                            if (_Schedular.currentAlgorithm != "p") {
                                // Take Last Process
                                console.log("Chosen Victim: " + victims[victims.length - 1].pid);
                                console.log("Chosen Victim Location: " + victims[victims.length - 1].location);
                                _MemoryManager.rollOut(victims[victims.length - 1]);   

                            } else {
                                // Filter for highest priority
                                victims.sort((a, b) => (a.priority > b.priority) ? -1 : 1);
                                _MemoryManager.rollOut(victims[0])
                            }

                            // Output to Kernel - Part II
                            _Kernel.krnTrace("Rolling in process.");
                            console.log("Location or ReadyQueue[0]: " + _ReadyQueue[0].location);
                            console.log("PID of RQ[0]: " + _ReadyQueue[0].pid)
                            _MemoryManager.rollIn(_ReadyQueue[0]);
                        }
                    }

                    _Schedular.scheduleProcess();
                    _CPU.updateState(pcb);
                }
                
                _CPU.isExecuting = true;
            }
        }
    }