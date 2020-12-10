/* ------------
     MemoryManager.ts

     Memory Manager is used to allocate and deallocate from our Main Memory while verifying that
     memory allocation does not exceed our total size.
------------ */

     module TSOS {
        export class MemoryManager {
            constructor(public memorySize : number = 0, 
                public memoryRegisters = []) {}

            init() {
                this.memorySize = _MemoryAccessor.getTotalSize();
                let segments = _MemoryAccessor.getTotalSize() / _MemoryAccessor.getSegmentSize(); // 3

                // Create Memory Segments
                for (let i = 0; i < segments; i++) {
                    // Create Registers
                    this.memoryRegisters[i] = { 
                        index: i,
                        baseRegister: i * _MemoryAccessor.getSegmentSize(),
                        limitRegister: _MemoryAccessor.getSegmentSize() * (i + 1),   // index starts at 0
                        isFilled: false
                    };
                }
            }

            load(program) {
                // Find Available Memory Segment
                let segment; 
                out:
                for (let i = 0; i < this.memoryRegisters.length; i++) {
                    if(this.memoryRegisters[i].isFilled == false) {
                        segment = i;
                        break out;  // Once found exit
                    }
                }

                // Create PCB for new program
                let pcb;

                if (segment == undefined) {
                    // Load Program into Disk
                    if (_krnDiskDriver.formatted) {
                        // Define our PCB
                        pcb = new processControlBlock();

                        // Create File Segment
                        let status = _krnDiskDriver.create("." + pcb.pid + "swap");

                        if (status.success) {
                            // Write Data to new file
                            let status = _krnDiskDriver.write('.' + pcb.pid + 'swap', program);

                            if (!status.success) {
                                _krnDiskDriver.delete('.' + pcb.pid + 'swap');
                                return null;
                            }

                            // Update PCB Location + State
                            pcb.location = "drive";
                            pcb.state = "resident";

                            // Add PCB to Resident List
                            _ResidentList.push(pcb);

                            // Return our updated PCB
                            return pcb;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } else {
                    // Define our PCB
                    pcb = new processControlBlock();

                    // Clear Memory Segment of Old Programs
                    _MemoryAccessor.clear(this.memoryRegisters[segment]);

                    // Load Program into Memory
                    let status;
                    for (let i = 0; i < program.length; i++) {
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
                    pcb.location = "memory";
                    pcb.state = "resident";

                    // Add PCB to Resident List
                    _ResidentList.push(pcb);

                    // Return our updated PCB
                    return pcb;
                }   
            }

            public rollOut(pcb) {
                // Create File Info for PCB Swap file
                let name = '.' + pcb.pid + 'swap';  // All Swap Files are hidden
                let result = _krnDiskDriver.create(name);

                // Check File Creation Results
                if (result.success) {
                    // Collect Process Data
                    let data = [];
                    for (let i = 0; i < _MemoryAccessor.getSegmentSize(); i++) {
                        // Check Hex if needs padding
                        let hex = TSOS.Utils.padHexValue(_MemoryAccessor.read(pcb.segment, i));
                        data.push(hex);
                    }

                    // Write Data to Swap File
                    result = _krnDiskDriver.write(name, data, true);

                    if (result.success) {
                        // Find + Update Memory Segment
                        let segment;

                        out:
                        for (let i = 0; i < _MemoryManager.memoryRegisters.length; i++) {
                            if(_MemoryManager.memoryRegisters[i].index == pcb.segment.index) {
                                segment = i;
                                break out;  // Once found exit
                            }
                        }

                        _MemoryManager.memoryRegisters[segment].isFilled = false; 

                        // Update our PCB 
                        pcb.location = "drive";
                        pcb.segment = {};

                    } else {
                        _krnDiskDriver.delete(name);    // Remove Directory Entry
                    }
                } 
            }

            public rollIn(pcb) {
                // Find Available Memory Segment
                let segment;

                out:
                for (let i = 0; i < this.memoryRegisters.length; i++) {
                    if (this.memoryRegisters[i].isFilled == false) {
                        segment = i;
                        break out;  // Once found exit
                    }
                }

                if (segment) {
                    // Get Data from Swap File
                    let file = _krnDiskDriver.read('.' + pcb.pid + 'swap');
                    let data = file.msg.match(/.{2}/g);

                    if (file.success) {
                        // Clear Memory Segment
                        _MemoryAccessor.clear(this.memoryRegisters[segment]);

                        // Load Data into Memory Segment
                        for (let i = 0; i < data.length; i++) {
                            let status = _MemoryAccessor.write(this.memoryRegisters[segment], i, data[i]);
    
                            // Check if Write to Memory Succeeded
                            if (!status) {
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
                        _krnDiskDriver.delete('.' + pcb.pid + 'swap');
                    } 
                } 
            }
        }
    }