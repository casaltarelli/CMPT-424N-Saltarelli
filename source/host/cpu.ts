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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public IR: number = 0x00,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public PCB = null) {

        }

        public init(): void {
            this.PC = 0;
            this.IR = 0x00;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.PCB = null;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.IR = parseInt(_MemoryAccessor.read(this.PCB.memory), 16);

            // Read over given OP Code
            switch(this.IR) {
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
                    this.loadYRegWithConstant
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
                    _Kernel.krnTrapError(`Process Execution Exception: Instruction '${this.IR.toString(16).toUpperCase()}' is not valid`);
                    this.isExecuting = false;    
                    break;
            }
        }

        //TODO: Implement Op Code Functionality
        increasePC() {
            this.PC++;
        }
        // OP Codes
        loadAccWithConstant() {
            this.increasePC();
            this.Acc = parseInt(_MemoryAccessor.read(this.PC), 16);
        }

        loadAccFromMemory() {
            this.increasePC();
            let address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            this.Acc = parseInt(_MemoryAccessor.read(address), 16);
        }

        storeAccInMemory() {
            this.increasePC();
            let address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            _MemoryAccessor.write(address, this.Acc.toString(16));
        }

        addWithCarry() {
            this.increasePC();
            let address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            this.Acc += parseInt(_MemoryAccessor.read(address), 16);

        }

        loadXRegWithConstant() {
            this.increasePC();
            this.Xreg = parseInt(_MemoryAccessor.read(this.PC), 16);
        }

        loadXRegFromMemory() {
            this.increasePC();
            let address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            this.Xreg = parseInt(_MemoryAccessor.read(address), 16);
        }

        loadYRegWithConstant() {
            this.increasePC();
            this.Yreg = parseInt(_MemoryAccessor.read(this.PC), 16);

        }

        loadYRegFromMemory() {
            this.increasePC();
            let address = parseInt(_MemoryAccessor.read(this.PC), 16);
            this.increasePC();
            this.Yreg = parseInt(_MemoryAccessor.read(address), 16);
        }

    }
}
