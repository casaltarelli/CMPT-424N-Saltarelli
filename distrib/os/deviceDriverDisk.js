/* ----------------------------------
   DeviceDriverDisk.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    var DeviceDriverDisk = /** @class */ (function (_super) {
        __extends(DeviceDriverDisk, _super);
        function DeviceDriverDisk(formatted, hidden, masterBootrecord, directory, file) {
            // Override the base method pointers.
            if (formatted === void 0) { formatted = false; }
            if (hidden === void 0) { hidden = "."; }
            if (masterBootrecord === void 0) { masterBootrecord = '0:0:0'; }
            if (directory === void 0) { directory = { 'start': { 't': 0, 's': 0, 'b': 1 }, 'end': { 't': 0, 's': 7, 'b': 6 } }; }
            if (file === void 0) { file = { 'start': { 't': 1, 's': 0, 'b': 0 }, 'end': { 't': 3, 's': 7, 'b': 6 } }; }
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            _this.formatted = formatted;
            _this.hidden = hidden;
            _this.masterBootrecord = masterBootrecord;
            _this.directory = directory;
            _this.file = file;
            _this.driverEntry = _this.krnDskDriverEntry;
            _this.isr = _this.krnDskDispatcher;
            return _this;
        }
        DeviceDriverDisk.prototype.krnDskDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            // Only Load Dsk Definition if User's browser supports it.
            if (this.krnDskBrowserSupport) {
                this.status = "loaded";
                // Clear Session Storage -- TESTING
                sessionStorage.clear();
            }
        };
        /**
         * krnDskBrowserSupport()
         * - Validates if the users' browser
         *   supports session storage.
         */
        DeviceDriverDisk.prototype.krnDskBrowserSupport = function () {
            try {
                return window['sessionStorage'] != null;
            }
            catch (e) {
                return false;
            }
        };
        /**
         * krnDskDispatcher
         * - Primary Dispatcher for
         *   all File System operations.
         */
        DeviceDriverDisk.prototype.krnDskDispatcher = function (params) {
            var status;
            if (params.action == 'format') {
                status = this.format(params.flag);
                _StdOut.putText(status);
            }
            else {
                if (this.formatted) {
                    switch (params.action) {
                        case 'create':
                            status = this.create(params.name, params.flag);
                            _StdOut.putText(status);
                            break;
                        case 'write':
                            status = this.write(params.name, params.data);
                            _StdOut.putText(status);
                            break;
                        case 'read':
                            status = this.read(params.name);
                            _StdOut.putText(status);
                            break;
                        default:
                            _Kernel.krnTrapError("File System exception: Invalid action " + params.action + ".");
                    }
                }
                else {
                    _StdOut.putText("File System exception. Must format Hard Drive first.");
                }
            }
        };
        /**
         * format(flag?)
         * - Initializes our Disk
         *   definition, type is a boolean
         *   flag used to determine half or full.
         */
        DeviceDriverDisk.prototype.format = function (flag) {
            // Verify Disk isn't already formatted
            if (!this.formatted) {
                _Disk.init(flag);
                this.formatted = true;
                // Output Success
                return "Hard drive fully formatted.";
            }
            else {
                return "Hard drive has already been fully formatted";
            }
        };
        /**
         * create(name, flag?)
         * - Creates a file with a given
         *   name within our File System.
         *   Flag is used for Copy Functionality
         */
        DeviceDriverDisk.prototype.create = function (name, flag) {
            // Validate Length of File Name
            if (name.length > _Disk.getDataSize()) {
                return 'File name ' + name + ' is too big.';
            }
            else {
                // Validate New File doesn't already exist within our directory
                if (!this.find(name, this.directory)) {
                    // Get Available Directory Keys
                    var availableKeys = this.getKeys(this.directory, 1);
                    if (availableKeys.length > 0) {
                        // Get Current Key
                        var key = availableKeys[0];
                        // Create Header + File Name Block
                        var block = this.buildBlock(name);
                        // Set Item in Session Storage
                        sessionStorage.setItem(key, block.join(''));
                        return "File " + name + " created.";
                    }
                    else {
                        return "File " + name + " could not be created. No available space.";
                    }
                }
                else {
                    return "File " + name + " already exists.";
                }
            }
        };
        /**
         * write(name, data)
         * - Writes to a file with a
         *   given name in our File System.
         */
        DeviceDriverDisk.prototype.write = function (name, data) {
            // Validate File Exists
            if (this.find(name, this.directory)) {
                // Get Needed Block Size
                var size = Math.floor(data.length / _Disk.getDataSize());
                if (data.length % _Disk.getDataSize() != 0) {
                    size++; // Additonal Block for leftovers
                }
                // Find all needed keys
                var availableKeys = this.getKeys(this.file, size);
                // Verify needed all keys found
                if (availableKeys.length > 0) {
                    // Get Directory Block Reference
                    var directoryBlock = this.find(name, this.directory, true);
                    // Updated Directory Block w/ Pointer
                    var block = this.buildBlock(name, availableKeys[0]);
                    sessionStorage.setItem(directoryBlock.key, block.join(''));
                    // Populate Files
                    for (var i = 0; i < availableKeys.length; i++) {
                        // Get Data Segment + Updated Data Reference;
                        var dataSegment = this.getDataBlock(data);
                        data = dataSegment.data;
                        // Check for pointer
                        var block_1 = void 0;
                        if (availableKeys[i + 1]) {
                            block_1 = this.buildBlock(dataSegment.segment, availableKeys[i + 1]);
                        }
                        else {
                            block_1 = this.buildBlock(dataSegment.segment);
                        }
                        // Update Item in Session Storage
                        sessionStorage.setItem(availableKeys[i], block_1.join(''));
                    }
                    return "File write to " + name + " done.";
                }
                else {
                    return "Cannot write data to " + name + ". No available space.";
                }
            }
            else {
                return "File " + name + " does not exist.";
            }
        };
        /**
         * read(name)
         * - Reads a file with a given
         *   name from our File System.
         */
        DeviceDriverDisk.prototype.read = function (name) {
            // Validate File Exists
            if (this.find(name, this.directory)) {
                // Get Block Object
                var block = this.find(name, this.directory, true);
                // Validate Directory Pointer to Data
                if (block.pointer.indexOf('-') !== -1) {
                    return "No data to read. File is empty.";
                }
                else {
                    var collecting = true;
                    var data = "";
                    while (collecting) {
                        // Check for next Pointer to Data
                        if (block.pointer.indexOf('-') == -1) {
                            // Convert Pointer + Create Block
                            var pointerKey = this.convertKey(block.pointer);
                            block = this.convertBlock(pointerKey);
                            // Add Data Block
                            data = data + block.data;
                        }
                        else {
                            collecting = false;
                        }
                    }
                    // Remove Empty Space Markers
                    var markerStart = data.indexOf("--");
                    data = data.substring(0, markerStart);
                    // Return File Data
                    return data;
                }
            }
            else {
                return "File " + name + " does not exist ";
            }
        };
        /**
         * delete(name)
         * - Deletes a file with a
         *   given name in our File System.
         */
        DeviceDriverDisk.prototype["delete"] = function (name) { };
        /**
         * find(name, source, flag?)
         * - Used to test if a given name
         *   within a source exists. Can return
         *   boolean or the found object dependent on flag.
         */
        DeviceDriverDisk.prototype.find = function (name, source, flag) {
            var block;
            var found = false;
            var start = source.start;
            var end = source.end;
            out: for (var t = start.t; t <= end.t; t++) {
                for (var s = start.s; s <= end.s; s++) {
                    for (var b = start.b; b <= end.b; b++) {
                        block = this.convertBlock({ t: t, s: s, b: b });
                        // Only Check Filled Blocks
                        if (block.filled) {
                            if (block.data == name) {
                                found = true;
                                break out; // Break out to prevent block overwrite
                            }
                        }
                    }
                }
            }
            // Flag used to determine if boolean or object return type
            if (flag) {
                return block;
            }
            else {
                return found;
            }
        };
        /**
         * buildBlock(data, pointer?)
         * - Used to construct our header array
         *   to concatenated with our data block.
         */
        DeviceDriverDisk.prototype.buildBlock = function (data, pointer) {
            var block;
            // Create Reserved Header
            if (pointer) {
                // Convert to Object
                pointer = this.convertKey(pointer);
                block = ['1', pointer.t, pointer.s, pointer.b];
            }
            else {
                block = ['1', '-', '-', '-'];
            }
            // Add Data to Block
            block.push(data);
            return block;
        };
        /**
         * getDataBlock(data)
         * - Creates a string segment from
         *   the given data string. Returns
         *   object containing segment + updated
         *   data.
         */
        DeviceDriverDisk.prototype.getDataBlock = function (data) {
            // Check if Data Type
            if (typeof (data) == 'string') {
                // Convert to Array of two char strings
                data = data.match(/.{2}/g);
            }
            // Populate Data Segment
            var segment = [];
            for (var i = 0; i < _Disk.getDataSize(); i++) {
                // Check for leftover padding
                if (i > data.length) {
                    segment.push('--');
                }
                else {
                    segment.push(data[i]);
                }
            }
            // Convert Data back to String
            data = data.join('');
            return { 'segment': segment.join(''), 'data': data.substring(_Disk.getDataSize()) };
        };
        /**
         * getKeys(source, size)
         * - Returns a list of String Keys
         *   for segments of our disk that
         *   are not filled.
         */
        DeviceDriverDisk.prototype.getKeys = function (source, size) {
            // Break Down Params
            var start = source.start;
            var end = source.end;
            var count = 0;
            var availableKeys = [];
            out: for (var t = start.t; t <= end.t; t++) {
                for (var s = start.s; s <= end.s; s++) {
                    for (var b = start.b; b <= end.b; b++) {
                        var block = this.convertBlock({ 't': t, 's': s, 'b': b });
                        // Check if filled
                        if (!block.filled) {
                            // Add valid key to list
                            availableKeys.push(this.convertKey({ 't': t, 's': s, 'b': b }));
                            count++;
                        }
                        // Check if needed keys have been found
                        if (count == size) {
                            break out;
                        }
                    }
                }
            }
            if (count == size) {
                return availableKeys;
            }
            else {
                return []; // No Available Space
            }
        };
        /**
         * convertKey(key)
         * - Converts key to both
         *   object or string based
         *   on key param given
         */
        DeviceDriverDisk.prototype.convertKey = function (key) {
            if (typeof (key) == 'object') { // Session Storage 
                return key.t + ':' + key.s + ':' + key.b;
            }
            else if (typeof (key) == 'string') { // Indexing
                // Validate Key Type [ID or Pointer]
                if (key.indexOf(':') !== -1) {
                    key = key.split(':');
                    return { 't': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2]) };
                }
                else {
                    key = key.split('');
                    return { 't': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2]) };
                }
            }
        };
        /**
         * ConvertBlock(key)
         * - Creates a Block Object based
         *   on a key used within SessionStorage
         */
        DeviceDriverDisk.prototype.convertBlock = function (key) {
            if (typeof (key) == 'object') {
                key = this.convertKey(key);
            }
            // Get Item in Session Storage
            var block = sessionStorage.getItem(key);
            var filled = false;
            if (block[0] == "1") {
                filled = true;
            }
            // Create Block Object
            var object = { 'key': key,
                'filled': filled,
                'pointer': block.substring(1, 4),
                'data': block.substring(_Disk.getHeaderSize()) };
            return object;
        };
        /**
         * clearBlock(key)
         * - reinitializes a block
         *   within our disk
         */
        DeviceDriverDisk.prototype.clearBlock = function (key) {
            _Disk.loadBlock(key);
        };
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
