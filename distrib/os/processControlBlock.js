/* ------------
     processControlBlock.ts

     The Process Control Block (referred to as PCB) is used to store information about the current
     process being executed by our CPU
------------ */
var TSOS;
(function (TSOS) {
    var processControlBlock = /** @class */ (function () {
        function processControlBlock(state, PC, pid, Acc, Xreg, Yreg, Zflag) {
            if (state === void 0) { state = "new"; }
            if (PC === void 0) { PC = 0; }
            if (pid === void 0) { pid = _PIDCounter++; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            this.state = state;
            this.PC = PC;
            this.pid = pid;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
        }
        processControlBlock.prototype.terminate = function () {
            var _this = this;
            // Update State + Ready Queue
            this.state = "terminated";
            _ReadyQueue = _ReadyQueue.filter(function (element) { return element.pid != _this.pid; });
            console.log("PROCESS TERMINATED");
            // Update Console
            _StdOut.advanceLine();
            _StdOut.putText("Process " + this.pid + " terminated.");
            _StdOut.advanceLine();
            _OsShell.putName();
            _OsShell.putPrompt();
        };
        return processControlBlock;
    }());
    TSOS.processControlBlock = processControlBlock;
})(TSOS || (TSOS = {}));
