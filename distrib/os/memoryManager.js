/* ------------
     MemoryManager.ts

     Memory Manager is used to allocate and deallocate from our Main Memory while verifying that
     memory allocation does not exceed our total size.
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(memorySize, memoryRegisters) {
            if (memorySize === void 0) { memorySize = 0; }
            if (memoryRegisters === void 0) { memoryRegisters = []; }
            this.memorySize = memorySize;
            this.memoryRegisters = memoryRegisters;
        }
        MemoryManager.prototype.init = function () {
            this.memorySize = _MemoryAccessor.getTotalSize();
            var segments = _MemoryAccessor.getTotalSize() / _MemoryAccessor.getSegmentSize(); // 3
            // Create Memory Segments
            for (var i = 0; i < segments; i++) {
                // Create Registers
                this.memoryRegisters[i] = {
                    index: i,
                    baseRegister: i * _MemoryAccessor.getSegmentSize(),
                    limitRegister: _MemoryAccessor.getSegmentSize() * (i + 1),
                    isFilled: false
                };
            }
        };
        MemoryManager.prototype.load = function (program) {
            // Find Available Memory Segment
            var segment;
            out: for (var i = 0; i < this.memoryRegisters.length; i++) {
                if (this.memoryRegisters[i].isFilled == false) {
                    segment = i;
                    break out; // Once found exit
                }
            }
            // Return null if no segments are empty
            if (segment == undefined) {
                return null;
            }
            // Create PCB for new program
            var pcb = new TSOS.processControlBlock();
            // Clear Memory Segment of Old Programs
            _MemoryAccessor.clear(this.memoryRegisters[segment]);
            // Load Program into Memory
            var status;
            for (var i = 0; i < program.length; i++) {
                status = _MemoryAccessor.write(this.memoryRegisters[segment], i, program[i]);
                // Check if Write to Memory Succeeded
                if (!status) {
                    console.log("Failed to write process into memory segment");
                    return; // Terminate Load if Failed
                }
            }
            // Update Segment Status + PCB Reference
            this.memoryRegisters[segment].isFilled = true;
            pcb.segment = this.memoryRegisters[segment];
            pcb.state = "resident";
            // Add PCB to Resident List
            _ResidentList.push(pcb);
            // Return our updated PCB
            return pcb;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
