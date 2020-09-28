/* ------------
     MemoryManager.ts

     Memory Manager is used to allocate and deallocate from our Main Memory while verifying that
     memory allocation does not exceed our total size.
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(memorySize, baseRegister, limitRegister) {
            if (memorySize === void 0) { memorySize = 0; }
            if (baseRegister === void 0) { baseRegister = 0; }
            if (limitRegister === void 0) { limitRegister = 0; }
            this.memorySize = memorySize;
            this.baseRegister = baseRegister;
            this.limitRegister = limitRegister;
        }
        MemoryManager.prototype.init = function () {
            this.memorySize = _MemoryAccessor.getTotalSize();
            this.baseRegister = 0;
            this.limitRegister = _MemoryAccessor.getTotalSize() - 1;
        };
        MemoryManager.prototype.load = function (program) {
            // Create PCB for new program
            var pcb = new TSOS.processControlBlock();
            // Clear Memory of Old Programs
            _MemoryAccessor.clear();
            // Load Program into Memory
            var status;
            for (var i = 0; i < program.length; i++) {
                status = _MemoryAccessor.write(i, program[i]);
                // Check if Write to Memory Succeeded
                if (!status) {
                    return; // Terminate Load if Failed
                }
            }
            // Update PCB State + Global Reference
            pcb.state = "resident";
            _PCB = pcb;
            // Add PCB to Resident List
            _ResidentList.push(pcb);
            // Return our updated PCB
            return pcb;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
