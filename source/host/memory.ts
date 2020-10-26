/* ------------
     Memory.ts

     Memory is used to create our Main Memory and initalizes it as empty
------------ */

module TSOS {

    export class Memory {

        constructor(public totalSize = 768,
                    public segmentSize = 256, 
                    public mainMemory = []
                ) {
        }

        init() : void {
            // Fill each memory with 00's to mark as empty
            for (let i = 0; i < this.totalSize; i++) {
                this.mainMemory[i] = "00";
            }
            
        }
    }
}