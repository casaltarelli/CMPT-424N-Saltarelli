/* ------------
     Disk.ts

     The Disk symbolizes a model of a Hard Drive Disk within our Operating System
------------ */

    module TSOS {
        export class Disk {
            constructor(public trackSize = 3, 
                        public sectorSize = 7, 
                        public blockSize = 6, 
                        public headerSize = 4, 
                        public dataSize = 60,
                        public full = true) {}

            init(flag) : void {
                // Update Full Value 
                this.full = flag;

                // Create Disk Segments
                for (let t = 0; t <= this.trackSize; t++) {
                    for (let s = 0; s <= this.sectorSize; s++){
                        for (let b = 0; b <= this.blockSize; b++) {
                            // Load individual block
                            this.loadBlock(t + ':' + s + ':' + b);
                        }
                    }
                }

                // TODO: Create Master Boot Record
                //this.loadBlock("0:0:0");
            }

            public loadBlock(key) {
                // Create Block Data + Reserved Header
                let header = ['0', 'F', 'F', 'F'];      // [0: Empty  1: Filled] [F F F Null Pointer]

                let data = [];
                
                // Init based on format option
                if (this.full) {
                    for (let i = 0; i < this.dataSize; i++) {
                        data.push("00");
                    }
    
                    // Combine header + data
                    data = header.concat(data);

                    // Set Block in Session Storage
                    sessionStorage.setItem(key, data.join(''));
                } else {
                    // Set Block in Session Storage
                    sessionStorage.setItem(key, header.join(''));
                } 
            }

            public getHeaderSize() {
                return this.headerSize;
            }

            public getDataSize() {
                return this.dataSize;
            }

            public getTrackSize() {
                return this.trackSize;
            }

            public getSectorSize() {
                return this.sectorSize;
            }

            public getBlockSize() {
                return this.blockSize;
            }


        }
    }