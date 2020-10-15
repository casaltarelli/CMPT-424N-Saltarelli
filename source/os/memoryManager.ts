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
                    }
                }
            }

            load(program) {
                // Find Available Memory Segment
                let segment; 
                for (let i = 0; i < this.memoryRegisters.length; i++) {
                    if(this.memoryRegisters[i].isFilled == false) {
                        segment = i;
                        break;  // Once found exit
                    }
                }

                // Create PCB for new program
                let pcb = new processControlBlock();

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

                // Update PCB State + Global Reference
                pcb.state = "resident";
                //_PCB = pcb;

                // Add PCB to Resident List
                _ResidentList.push(pcb);

                // Return our updated PCB
                return pcb;
            }
        }
    }