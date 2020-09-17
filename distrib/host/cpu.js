/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, IR, Acc, Xreg, Yreg, Zflag, isExecuting, PCB) {
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = 0x00; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (PCB === void 0) { PCB = null; }
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.PCB = PCB;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.IR = 0x00;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.PCB = null;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.IR = parseInt(_MemoryAccessor.read(this.PCB.memory), 16);
            // Read over given OP Code
            switch (this.IR) {
                case 0xA9:
                    // Call on LoadAccumulatorConstant()
                    this.loadAccWithConstant();
                    break;
                case 0xAD:
                    // Call on LoadAccumulatorMemory()
                    this.loadAccFromMemory();
                    break;
                case 0x8D:
                    // Call on StoreAccumulatorMemory()
                    this.storeAccInMemory();
                    break;
                case 0x6D:
                    // Call on AddWithCarry()
                    this.addWithCarry();
                    break;
                case 0xA2:
                    // Call on LoadXConstant()
                    this.loadXRegWithConstant();
                    break;
                case 0xAE:
                    // Call on LoadXMemory()
                    this.loadXRegFromMemory();
                    break;
                case 0xA0:
                    // Call on LoadYConstant()
                    this.loadYRegWithConstant;
                    break;
                case 0xAC:
                    // Call on LoadYMemory()
                    this.loadYRegFromMemory();
                    break;
                case 0xEA:
                    // Call on NoOperation()
                    break;
                case 0x00:
                    // Call on Break()
                    break;
                case 0xEC:
                    // Call on CompareX()
                    break;
                case 0xD0:
                    // Call on Branch()
                    break;
                case 0xEE:
                    // Call on IncrementByte()
                    break;
                case 0xFF:
                    // Call on SystemCall() 
                    break;
                default:
                    _Kernel.krnTrapError("Process Execution Exception: Instruction '" + this.IR.toString(16).toUpperCase() + "' is not valid");
                    this.isExecuting = false;
                    break;
            }
        };
        //TODO: Implement Op Code Functionality
        Cpu.prototype.increasePC = function () {
            this.PC++;
        };
        // OP Codes
        Cpu.prototype.loadAccWithConstant = function () {
            this.increasePC();
            this.Acc = parseInt(_MemoryAccessor.read(this.PC), 16);
        };
        Cpu.prototype.loadAccFromMemory = function () {
            this.increasePC();
            var address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            this.Acc = parseInt(_MemoryAccessor.read(address), 16);
        };
        Cpu.prototype.storeAccInMemory = function () {
            this.increasePC();
            var address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            _MemoryAccessor.write(address, this.Acc.toString(16));
        };
        Cpu.prototype.addWithCarry = function () {
            this.increasePC();
            var address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            this.Acc += parseInt(_MemoryAccessor.read(address), 16);
        };
        Cpu.prototype.loadXRegWithConstant = function () {
            this.increasePC();
            this.Xreg = parseInt(_MemoryAccessor.read(this.PC), 16);
        };
        Cpu.prototype.loadXRegFromMemory = function () {
            this.increasePC();
            var address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            this.Xreg = parseInt(_MemoryAccessor.read(address), 16);
        };
        Cpu.prototype.loadYRegWithConstant = function () {
            this.increasePC();
            this.Yreg = parseInt(_MemoryAccessor.read(this.PC), 16);
        };
        Cpu.prototype.loadYRegFromMemory = function () {
            this.increasePC();
            var address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            this.Yreg = parseInt(_MemoryAccessor.read(address), 16);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
