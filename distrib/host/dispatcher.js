/* ------------
     Dispatcher.ts

     The Dispatcher controls allocatiing our CPU to the respective process that has been determined by our schedular.

     Note: It's pretty cool how much power this little guy has
------------ */
var TSOS;
(function (TSOS) {
    var Dispatcher = /** @class */ (function () {
        function Dispatcher() {
        }
        /**
         * runProcess(PCB)
         * - Updates our CPU PCB reference
         *   to be executed on the next cycle
         */
        Dispatcher.prototype.runProcess = function (pcb) {
            // Check if PCB given is null... Find next available Process
            out: if (pcb == null && _ReadyQueue.length > 0) {
                for (var _i = 0, _ReadyQueue_1 = _ReadyQueue; _i < _ReadyQueue_1.length; _i++) {
                    var process = _ReadyQueue_1[_i];
                    if (process.state == "ready") {
                        pcb = process;
                        break out;
                    }
                }
            }
            // Update State of current Process -- if there is one
            if (_CPU.PCB && _CPU.PCB.state != "terminated") {
                _CPU.PCB.state = "ready";
            }
            else if (_CPU.PCB && _CPU.PCB.state == "terminated") {
                _ReadyQueue.filter(function (element) { return element != _CPU.PCB; });
            }
            // Check if PCB is already in our Ready Queue (multiple run <pid> bug pervention)
            if (_ReadyQueue.indexOf(pcb) == -1) {
                _ReadyQueue.push(pcb);
            }
            // Verify if given PCB is first process
            if (_ReadyQueue.indexOf(pcb) != 0) {
                pcb.state = "ready";
            }
            else {
                pcb.state = "running";
                if (pcb.location == "drive") {
                    // Check Memory Segments for Potential Empty Segment
                    var segment = void 0;
                    out: for (var i = 0; i < _MemoryManager.memoryRegisters.length; i++) {
                        if (_MemoryManager.memoryRegisters[i].isFilled == false) {
                            segment = i;
                            break out; // Once found exit
                        }
                    }
                    if (segment == undefined) {
                        // Initiate Roll Out/ Roll In Routine - Part I
                        _Kernel.krnTrace("Rolling out process.");
                        // Get All Process in Main Memory not running or terminated stored 
                        var victims = _ResidentList.filter(function (pcb) { return pcb.location == "memory" && (pcb.state == "ready" || pcb.state == "resident"); });
                        // Validate Available Victim
                        if (victims.length > 0) {
                            // Choose Process based on Scheduling Algorithm
                            if (_Schedular.currentAlgorithm != "p") {
                                // Take Last Process
                                _MemoryManager.rollOut(victims[victims.length - 1]);
                            }
                            else {
                                // Filter for highest priority
                                victims.sort(function (a, b) { return (a.priority > b.priority) ? -1 : 1; });
                                _MemoryManager.rollOut(victims[0]);
                            }
                        }
                        else {
                            // Manually Make Segment available for lone Disk Process
                            victims = _ResidentList.filter(function (pcb) { return pcb.location == "memory" && pcb.state == "terminated"; });
                            _MemoryManager.rollOut(victims[0]);
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, victims[0]));
                        }
                        // Output to Kernel - Part II
                        _Kernel.krnTrace("Rolling in process.");
                        _MemoryManager.rollIn(_ReadyQueue[0]);
                    }
                }
                _Schedular.scheduleProcess();
                _CPU.updateState(pcb);
            }
            _CPU.isExecuting = true;
        };
        return Dispatcher;
    }());
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
