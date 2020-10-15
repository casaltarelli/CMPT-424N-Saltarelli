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
            this.IR = parseInt(_MemoryAccessor.read(this.PCB.segment, this.PC), 16);

            // Read over given OP Code
            switch(this.IR) {
                case 0xA9:
                    this.loadAccWithConstant();
                    break;

                case 0xAD:
                    this.loadAccFromMemory(); 
                    break;

                case 0x8D:
                    this.storeAccInMemory();
                    break;

                case 0x6D:
                    this.addWithCarry();
                    break;

                case 0xA2:
                    this.loadXRegWithConstant();
                    break;

                case 0xAE:
                    this.loadXRegFromMemory();
                    break;

                case 0xA0:
                    this.loadYRegWithConstant();
                    break;

                case 0xAC:
                    this.loadYRegFromMemory();
                    break;

                case 0xEA:
                    // Break for No Operation
                    break;

                case 0x00:
                    this.saveState();
                    _Kernel.krnTerminateProcess()
                    break;

                case 0xEC:
                    this.compareToXreg();
                    break;

                case 0xD0:
                    this.branchOnBytes();
                    break;

                case 0xEE:
                    this.incrementByBytes();
                    break;

                case 0xFF:
                    this.systemCall();
                    break;

                default: 
                    _Kernel.krnTerminateProcess()
                    _Kernel.krnTrapError(`Process Execution Exception: Instruction '${this.IR.toString(16).toUpperCase()}' is not valid`); 
                    break;
            }

            // Increase PC for IR
            this.increasePC();
        }

        increasePC() {
            this.PC++;
        }

        saveState() {
            // Update Process Control Block to Current CPU
            if (this.PCB) {
                this.PCB.PC = this.PC;
                this.PCB.IR = this.IR;
                this.PCB.Acc = this.Acc;
                this.PCB.Xreg = this.Xreg;
                this.PCB.Yreg = this.Yreg;
                this.PCB.Zflag = this.Zflag;
            }
        }

        updateState(pcb) {
            // Update Process Control Block object
            this.saveState();
            this.PCB = pcb;
            this.PC = pcb.PC;
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
        }

        getFullAddress() {
            // Increase PC to get First Part
            this.increasePC();

            // First + Increase PC
            let address = _MemoryAccessor.read(this.PCB.segment, this.PC);
            this.increasePC();

            // Second
            address =  parseInt(_MemoryAccessor.read(this.PCB.segment, this.PC), 16) + parseInt(address, 16);

            // Return Full Address
            return address;
        }
        // OP Codes
        loadAccWithConstant() {
            this.increasePC();
            this.Acc = parseInt(_MemoryAccessor.read(this.PCB.segment, this.PC), 16);
        }

        loadAccFromMemory() {
            let address = this.getFullAddress();
            this.Acc = parseInt(_MemoryAccessor.read(this.PCB.segment, address), 16);
        }

        storeAccInMemory() {
            let address = this.getFullAddress();
            _MemoryAccessor.write(this.PCB.segment, address, this.Acc.toString(16));
        }

        addWithCarry() {
            let address = this.getFullAddress();
            this.Acc += parseInt(_MemoryAccessor.read(this.PCB.segment, address), 16);
        }

        loadXRegWithConstant() {
            this.increasePC();
            this.Xreg = parseInt(_MemoryAccessor.read(this.PCB.segment, this.PC), 16);
        }

        loadXRegFromMemory() {
            let address = this.getFullAddress();
            this.Xreg = parseInt(_MemoryAccessor.read(this.PCB.segment, address), 16);
        }

        loadYRegWithConstant() {
            this.increasePC();
            this.Yreg = parseInt(_MemoryAccessor.read(this.PCB.segment, this.PC), 16);
        }

        loadYRegFromMemory() {
            let address = this.getFullAddress();
            this.Yreg = parseInt(_MemoryAccessor.read(this.PCB.segment, address), 16);
        }

        compareToXreg() {
            let address = this.getFullAddress();
            let value = parseInt(_MemoryAccessor.read(this.PCB.segment, address), 16);

            // Update CPU Zflag accordingly
            if (value === this.Xreg) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }
        }

        branchOnBytes() {
            // Get Byte Value
            this.increasePC();
            let bytes = parseInt(_MemoryAccessor.read(this.PCB.segment, this.PC), 16);

            if (this.Zflag === 0) {
                this.PC = this.PC + bytes;

                // Check if PC is greater than Total Size
                if (this.PC > _MemoryAccessor.getTotalSize()) {
                    this.PC %= _MemoryAccessor.getTotalSize();
                }
            } 
        }

        incrementByBytes() {
            // Get Address
            let address = this.getFullAddress();

            // Get Value
            let value = parseInt(_MemoryAccessor.read(this.PCB.segment, address), 16);
            value++;

            // Update Memory
            _MemoryAccessor.write(this.PCB.segment, address, value.toString());
        }

        systemCall() {
           if (this.Xreg == 1) {
               _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_YREGISTER_IRQ, null));
           } else if (this.Xreg == 2) {
               _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_FROM_MEMORY_IRQ, null));
           }
        }
    }
}
