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
            // Create PCB for new program
            var pcb = new TSOS.processControlBlock();
            if (segment == undefined) {
                // Load Program into Disk
                if (_krnDiskDriver.formatted) {
                    // Create File Segment
                    var status_1 = _krnDiskDriver.create("." + pcb.pid + "swap");
                    if (status_1.success) {
                        // Write Data to new file
                        var status_2 = _krnDiskDriver.write('.' + pcb.pid + 'swap', program);
                        if (!status_2.success) {
                            _krnDiskDriver["delete"]('.' + pcb.pid + 'swap');
                            return null;
                        }
                        // Update PCB Location + State
                        pcb.location = "hdd";
                        pcb.state = "resident";
                        // Add PCB to Resident List
                        _ResidentList.push(pcb);
                        // Return our updated PCB
                        return pcb;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return null;
                }
            }
            else {
                // Clear Memory Segment of Old Programs
                _MemoryAccessor.clear(this.memoryRegisters[segment]);
                // Load Program into Memory
                var status_3;
                for (var i = 0; i < program.length; i++) {
                    status_3 = _MemoryAccessor.write(this.memoryRegisters[segment], i, program[i]);
                    // Check if Write to Memory Succeeded
                    if (!status_3) {
                        console.log("Failed to write process into memory segment");
                        return; // Terminate Load if Failed
                    }
                }
                // Update Segment Status + PCB Reference
                this.memoryRegisters[segment].isFilled = true;
                pcb.segment = this.memoryRegisters[segment];
                pcb.location = "memory";
                pcb.state = "resident";
                // Add PCB to Resident List
                _ResidentList.push(pcb);
                // Return our updated PCB
                return pcb;
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
