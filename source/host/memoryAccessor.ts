/* ------------
     MemoryAccessor.ts

     The Memory Accessor is used to access our Main Memory and get information about Main Memory. This file 
     handles all Read, Write, and Clear functonality.
     
------------ */

     module TSOS {
        export class MemoryAccessor {
            constructor() {}
    
            /**
             * read(segment, logicalAddress)
             * - Return Data contained in Main Memory
             *   at the provided Logical Address
             */
            read(segment, logicalAddress) {
                // Map Logical to Physical Address in Main Memory
                let physicalAddress = logicalAddress + segment.baseRegister;

                // Validate physical address doesn't exceed bounds
                if (physicalAddress < segment.baseRegister || physicalAddress > segment.limitRegitser) {
                    _Kernel.krnTrapError("Memory read exception: Memory address is out of bounds");
                } else {
                    return _Memory.mainMemory[physicalAddress];
                }
            }

            /**
             * write(segment, logicalAddress, value) : boolean
             * - Write given value at segment 
             *   in Main Memory
             */
            write(segment, logicalAddress, value) {
                // Check if val needs to get padded
                TSOS.Utils.padHexValue(value);

                // Map Logical to Physical Address in Main Memory
                let physicalAddress = logicalAddress + segment.baseRegister;

                // Validate physical address doesn't exceed bounds
                if (physicalAddress < segment.baseRegister || physicalAddress > segment.limitRegitser) {
                    _Kernel.krnTrapError("Memory write exception: Memory address is out of bounds");
                    return false;
                } else {
                    _Memory.mainMemory[physicalAddress] = value;
                    return true;
                }
            }

            /**
             * clear(segment) 
             * - Empties a specified segment
             *   in Main Memory
             */
            clear(segment) {
                // Clear Memory for specific Segment
                for (let i = segment.baseRegister; i < segment.limitRegister; i++) {
                    console.log("Called!");
                    _Memory.mainMemory[i] = "00";
                }
            }

            /**
             * dump() 
             * - Return Main Memory
             */
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

            /**
             * getSegmentSize() : number
             * - Return the set Segment
             *   size
             */
            getSegmentSize() {
                return _Memory.segmentSize;
            }
        }
    }