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
                    public Acc = 0,
                    public Xreg = 0,
                    public Yreg = 0,
                    public Zflag = 0) {}

        terminate() {
            // Update State + Ready Queue
            this.state = "terminated";
            _ReadyQueue = _ReadyQueue.filter(element => element.pid != this.pid);
            console.log("PROCESS TERMINATED");

            // Update Console
            _StdOut.advanceLine();
            _StdOut.putText("Process " + this.pid + " terminated.");
            _StdOut.advanceLine();
            _OsShell.putName();
            _OsShell.putPrompt();
            
        }
    }
}