/* ------------
     MemoryAccessor.ts

     The Memory Accessor is used to access our Main Memory and get information about Main Memory. This file 
     handles all Read, Write, and Clear functonality.
     
------------ */

     module TSOS {
        export class MemoryAccessor {
            constructor() {}
    
            /**
             * read(logicalAddress)
             * - Return Data contained in Main Memory
             *   at the provided Logical Address
             */
            read(logicalAddress) {
                // Validate that logical address is actually applicable to Main Memory
                if (logicalAddress > _MemoryAccessor.getTotalSize() || logicalAddress < 0) {
                    // Trap Error
                    _Kernel.krnTrapError("Memory read exception: Memory address is out of bounds");
                } else {
                    return _Memory.mainMemory[logicalAddress];
                }
            }

            /**
             * write(logicalAddress, value) : boolean
             * - Write given value in Main Memory
             *   at specified Logical Address
             */
            write(logicalAddress, value) {
                // Pad Hex Value if only one character
                // TODO: Create Hex Padding Functionality

                if (logicalAddress > _MemoryAccessor.getTotalSize() || logicalAddress < 0) {
                    _Kernel.krnTrapError("Memory write exception: Memory address is out of bounds");
                    return false;
                } else {
                    _Memory.mainMemory[logicalAddress] = value;
                    console.log("Memory: " + _Memory.mainMemory.toString());
                    return true
                }
            }

            /**
             * clear() 
             * - Empties Main Memory of all
             *   stored values
             */
            clear() {
                // Fill each memory with 00's to mark as empty
                for (let i = 0; i < _MemoryAccessor.getTotalSize(); i++) {
                    _Memory.mainMemory[i] = "00";
                }
            }

            dump() {
                return _Memory.mainMemory;
            }

            /**
             * getTotalSize() : number
             * - Return the Total Size of 
             *   Main Memory
             */
            getTotalSize() {
                return _Memory.totalSize;
            }
        }
    }