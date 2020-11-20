/* ------------
     processControlBlock.ts

     The Process Control Block (referred to as PCB) is used to store information about the current
     process being executed by our CPU
------------ */
var TSOS;
(function (TSOS) {
    var processControlBlock = /** @class */ (function () {
        function processControlBlock(state, PC, pid, priority, Acc, Xreg, Yreg, Zflag, segment, waitTime, turnaroundTime) {
            if (state === void 0) { state = "new"; }
            if (PC === void 0) { PC = 0; }
            if (pid === void 0) { pid = _PIDCounter++; }
            if (priority === void 0) { priority = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (segment === void 0) { segment = {}; }
            if (waitTime === void 0) { waitTime = 0; }
            if (turnaroundTime === void 0) { turnaroundTime = 0; }
            this.state = state;
            this.PC = PC;
            this.pid = pid;
            this.priority = priority;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.segment = segment;
            this.waitTime = waitTime;
            this.turnaroundTime = turnaroundTime;
        }
        return processControlBlock;
    }());
    TSOS.processControlBlock = processControlBlock;
})(TSOS || (TSOS = {}));
