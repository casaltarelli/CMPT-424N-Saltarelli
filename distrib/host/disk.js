/* ------------
     Disk.ts

     The Disk symbolizes a model of a Hard Drive Disk within our Operating System
------------ */
var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk(trackSize, sectorSize, blockSize, headerSize, dataSize) {
            if (trackSize === void 0) { trackSize = 3; }
            if (sectorSize === void 0) { sectorSize = 7; }
            if (blockSize === void 0) { blockSize = 6; }
            if (headerSize === void 0) { headerSize = 4; }
            if (dataSize === void 0) { dataSize = 60; }
            this.trackSize = trackSize;
            this.sectorSize = sectorSize;
            this.blockSize = blockSize;
            this.headerSize = headerSize;
            this.dataSize = dataSize;
        }
        Disk.prototype.init = function () {
            // Create Disk Segments
            for (var t = 0; t < this.trackSize; t++) {
                for (var s = 0; s < this.sectorSize; s++) {
                    for (var b = 0; b < this.blockSize; b++) {
                        // TODO: Create Block Segment
                        this.loadBlock(t + ':' + s + ':' + b);
                    }
                }
            }
            // TODO: Create Master Boot Record
            this.loadBlock("0:0:0");
        };
        Disk.prototype.loadBlock = function (key) {
            // Create Block Data + Reserved Header
            var header = ['0', '-', '-', '-']; // [0: Empty  1: Filled] [- - - Null Pointer]
            var data = [];
            for (var i = 0; i < this.dataSize; i++) {
                data.push("00");
            }
            // Combine header + data
            data = header.concat(data);
            // Set Block in Session Storage
            sessionStorage.setItem(key, data.join('')); // Format Array Data as String
        };
        Disk.prototype.getHeaderSize = function () {
            return this.headerSize;
        };
        Disk.prototype.getDataSize = function () {
            return this.dataSize;
        };
        Disk.prototype.getTrackSize = function () {
            return this.trackSize;
        };
        Disk.prototype.getSectorSize = function () {
            return this.sectorSize;
        };
        Disk.prototype.getBlockSize = function () {
            return this.blockSize;
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
