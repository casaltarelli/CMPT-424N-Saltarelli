/* ------------
     Memory.ts

     Memory creates our Main Memory and initalizes it to be used by our OS
------------ */

module TSOS {
    export class Memory {
        constructor(public totalSize = 256, 
                    public mainMemory = []) {
        }

        init() {
            // Fill each memory with 00's to mark as empty
            for (let i = 0; i < this.totalSize; i++) {
                this.mainMemory[i] = "00";
            }
        }
    }
}