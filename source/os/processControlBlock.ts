/* ------------
     processControlBlock.ts

     The Process Control Block (referred to as PCB) is used to store information about the current 
     process being executed by our CPU
------------ */

module TSOS {
    export class processControlBlock {
        constructor(public state = "new",
                    public PC = 0,
                    public pid = _PIDCounter++,
                    public priority = 0,
                    public Acc = 0,
                    public Xreg = 0,
                    public Yreg = 0,
                    public Zflag = 0,
                    public segment = {},
                    public waitTime = 0,
                    public turnaroundTime = 0) {}
    }
}