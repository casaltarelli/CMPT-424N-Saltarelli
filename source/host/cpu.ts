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
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public PCB = null) {

        }

        public init(): void {
            this.PC = 0;
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

            var opCode;
            // Read over given OP Code
            switch(opCode) {
                case 0xA9:
                    // Call on LoadAccumulatorConstant()
                    break;

                case 0xAD:
                    // Call on LoadAccumulatorMemory()
                    break;

                case 0x8D:
                    // Call on StoreAccumulatorMemory()
                    break;

                case 0x6D:
                    // Call on AddWithCarry()
                    break;

                case 0xA2:
                    // Call on LoadXConstant()
                    break;

                case 0xAE:
                    // Call on LoadXMemory()
                    break;

                case 0xA0:
                    // Call on LoadYConstant()
                    break;

                case 0xAC:
                    // Call on LoadYMemory()
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
                    _Kernel.krnTrapError(`Process Execution Exception: Instruction '${opCode.toUpperCode()}' is not valid`);
                    this.isExecuting = false;    
                    break;
            }
        }

        //TODO: Implement Op Code Functionality

    }
}
