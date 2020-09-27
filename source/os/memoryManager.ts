/* ------------
     MemoryManager.ts

     Memory Manager is used to allocate and deallocate from our Main Memory while verifying that
     memory allocation does not exceed our total size.
------------ */

     module TSOS {
        export class MemoryManager {
            constructor(public memorySize : number = 0, 
                public baseRegister : number = 0, 
                public limitRegister : number = 0) {}

            init() {
                this.memorySize = _MemoryAccessor.getTotalSize();
                this.baseRegister = 0;
                this.limitRegister = _MemoryAccessor.getTotalSize() - 1;
            }

            load(program) {
                // Create PCB for new program
                let pcb = new processControlBlock();

                // Clear Memory of Old Programs
                _MemoryAccessor.clear();

                // Load Program into Memory
                let status;
                for (let i = 0; i < program.length; i++) {
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
            }
        }
    }