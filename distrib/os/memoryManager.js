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
            var pcb;
            if (segment == undefined) {
                // Load Program into Disk
                if (_krnDiskDriver.formatted) {
                    // Define our PCB
                    pcb = new TSOS.processControlBlock();
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
                        pcb.location = "drive";
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
                // Define our PCB
                pcb = new TSOS.processControlBlock();
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
        MemoryManager.prototype.rollOut = function (pcb) {
            // Create File Info for PCB Swap file
            var name = '.' + pcb.pid + 'swap'; // All Swap Files are hidden
            var result = _krnDiskDriver.create(name);
            // Check File Creation Results
            if (result.success) {
                // Collect Process Data
                var data = [];
                for (var i = 0; i < _MemoryAccessor.getSegmentSize(); i++) {
                    // Check Hex if needs padding
                    var hex = TSOS.Utils.padHexValue(_MemoryAccessor.read(pcb.segment, i));
                    data.push(hex);
                }
                // Write Data to Swap File
                result = _krnDiskDriver.write(name, data);
                if (result.success) {
                    // Find + Update Memory Segment
                    var segment = void 0;
                    out: for (var i = 0; i < _MemoryManager.memoryRegisters.length; i++) {
                        if (_MemoryManager.memoryRegisters[i].index == pcb.segment.index) {
                            segment = i;
                            break out; // Once found exit
                        }
                    }
                    _MemoryManager.memoryRegisters[segment].isFilled = false;
                    // Update our PCB 
                    pcb.location = "drive";
                    pcb.segment = {};
                }
                else {
                    _krnDiskDriver["delete"](name); // Remove Directory Entry
                }
            }
        };
        MemoryManager.prototype.rollIn = function (pcb) {
            // Find Available Memory Segment
            var segment;
            out: for (var i = 0; i < this.memoryRegisters.length; i++) {
                if (this.memoryRegisters[i].isFilled == false) {
                    segment = i;
                    break out; // Once found exit
                }
            }
            if (segment) {
                // Get Data from Swap File
                var file = _krnDiskDriver.read('.' + pcb.pid + 'swap');
                var data = file.msg.match(/.{2}/g);
                if (file.success) {
                    // Clear Memory Segment
                    _MemoryAccessor.clear(this.memoryRegisters[segment]);
                    // Load Data into Memory Segment
                    for (var i = 0; i < data.length; i++) {
                        var status_4 = _MemoryAccessor.write(this.memoryRegisters[segment], i, data[i]);
                        // Check if Write to Memory Succeeded
                        if (!status_4) {
                            console.log("Failed to write process into memory segment");
                            return; // Terminate Load if Failed
                        }
                    }
                    // Update Segment Filled Flag
                    this.memoryRegisters[segment].isFilled = true;
                    // Update our PCB
                    pcb.location = "memory";
                    pcb.segment = this.memoryRegisters[segment];
                    // Delete Old Swap File
                    _krnDiskDriver["delete"]('.' + pcb.pid + 'swap');
                }
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
