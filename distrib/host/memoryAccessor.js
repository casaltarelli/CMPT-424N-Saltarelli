/* ------------
     MemoryAccessor.ts

     The Memory Accessor is used to access our Main Memory and get information about Main Memory. This file
     handles all Read, Write, and Clear functonality.
     
------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        /**
         * read(logicalAddress)
         * - Return Data contained in Main Memory
         *   at the provided Logical Address
         */
        MemoryAccessor.prototype.read = function (logicalAddress) {
            // Validate that logical address is actually applicable to Main Memory
            if (logicalAddress > _MemoryAccessor.getTotalSize() || logicalAddress < 0) {
                // Trap Error
                _Kernel.krnTrapError("Memory read exception: Memory address is out of bounds");
            }
            else {
                return _Memory.mainMemory[logicalAddress];
            }
        };
        /**
         * write(logicalAddress, value) : boolean
         * - Write given value in Main Memory
         *   at specified Logical Address
         */
        MemoryAccessor.prototype.write = function (logicalAddress, value) {
            // Check if val needs to get padded
            TSOS.Utils.padHexValue(value);
            if (logicalAddress > _MemoryAccessor.getTotalSize() || logicalAddress < 0) {
                _Kernel.krnTrapError("Memory write exception: Memory address is out of bounds");
                return false;
            }
            else {
                _Memory.mainMemory[logicalAddress] = value;
                return true;
            }
        };
        /**
         * clear()
         * - Empties Main Memory of all
         *   stored values
         */
        MemoryAccessor.prototype.clear = function () {
            // Fill each memory with 00's to mark as empty
            for (var i = 0; i < _MemoryAccessor.getTotalSize(); i++) {
                _Memory.mainMemory[i] = "00";
            }
        };
        MemoryAccessor.prototype.dump = function () {
            return _Memory.mainMemory;
        };
        /**
         * getTotalSize() : number
         * - Return the Total Size of
         *   Main Memory
         */
        MemoryAccessor.prototype.getTotalSize = function () {
            return _Memory.totalSize;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
