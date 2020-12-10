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
                // Clear Session Storage -- TESTING PURPOSES ONLY
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
                            _StdOut.putText(status.msg);
                            break;
                        case 'write':
                            status = this.write(params.name, params.data);
                            _StdOut.putText(status.msg);
                            break;
                        case 'read':
                            status = this.read(params.name);
                            _StdOut.putText(status.msg);
                            break;
                        case 'delete':
                            status = this["delete"](params.name);
                            _StdOut.putText(status.msg);
                            break;
                        case 'list':
                            this.list(params.flag);
                            break;
                        case 'copy':
                            status = this.create(params.name, params.flag);
                            _StdOut.putText(status.msg);
                            break;
                        default:
                            _Kernel.krnTrapError("File System exception: Invalid action " + params.action + ".");
                    }
                }
                else {
                    _StdOut.putText("File System exception: Must format Hard Drive first.");
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
                return { 'success': true, 'msg': "Hard drive fully formatted." };
            }
            else {
                return { 'success': false, 'msg': "Hard drive has already been fully formatted." };
            }
        };
        /**
         * create(name, flag?)
         * - Creates a file with a given
         *   name within our File System.
         *   Flag is used for Copy Functionality as well.
         */
        DeviceDriverDisk.prototype.create = function (name, flag) {
            // Check Flag - Update Name for Copy Action
            var original = name;
            if (flag) {
                // Add Copy demoniator to Filename
                name = name + 'copy';
                // Check if a Copy already exists
                while (this.find(name, this.directory)) {
                    // If found add numerator to end of name, but first check if there is already a numerator
                    if (/^-?[\d.]+(?:e-?\d+)?$/.test(name.slice(-1))) {
                        var num = parseInt(name.slice(-1)) + 1;
                        // Update name
                        name = name.substring(0, name.length - 1) + num;
                    }
                    else {
                        name = name + 1;
                    }
                }
            }
            // Validate Length of File Name
            if (name.length > _Disk.getDataSize() - 15) { // Subtract for Date String YYYYMMDD HHMMSS
                return { 'success': false, 'msg': 'File name ' + name + ' is too big.' };
            }
            else {
                // Validate New File doesn't already exist within our directory
                if (!this.find(name, this.directory)) {
                    // Get Available Directory Key
                    var availableKeys = this.getKeys(this.directory, 1);
                    if (availableKeys.length > 0) {
                        // Get Key + Create Data Holder
                        var key = availableKeys[0];
                        var data = void 0;
                        // Get Timestamp for Entry
                        var timestamp = void 0;
                        timestamp = new Date();
                        var date = timestamp.toISOString().slice(0, 10).replace(/-/g, "");
                        var time = timestamp.getHours() + "" + timestamp.getMinutes() + "" + timestamp.getSeconds();
                        timestamp = '.' + date + time; // . Used a marker for end of file name
                        // Prep Data for Block Creation
                        data = this.convertHex(name + timestamp, 'hex');
                        data = data.match(/.{2}/g);
                        // Create Block for Directory Entry
                        var block = this.buildBlock(data, '1');
                        // Set Item in Session Storage
                        sessionStorage.setItem(key, block);
                        // If Copy action populate created directory
                        if (flag) {
                            data = this.read(original);
                            data = this.write(name, data);
                        }
                        return { 'success': true, 'msg': "File " + name + " created." };
                    }
                    else {
                        return { 'success': false, 'msg': "File " + name + " could not be created. No available space." };
                    }
                }
                else {
                    return { 'success': false, 'msg': "File System exception: " + name + " already exists." };
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
                // Encode Data to Hex for input + Accurate Size
                data = this.convertHex(data, 'hex');
                data = data.match(/.{2}/g);
                // Get Needed Block Size
                var size = Math.floor(data.length / _Disk.getDataSize());
                if (data.length % _Disk.getDataSize() != 0) {
                    size++; // Additonal Block for leftovers
                }
                // Find all needed keys within our File Range
                var availableKeys_1 = this.getKeys(this.file, size);
                // Verify all needed keys found
                if (availableKeys_1.length > 0) {
                    // Get Directory Block Reference
                    var directoryBlock_1 = this.find(name, this.directory, true);
                    // Check if File already contains data
                    if (directoryBlock_1.pointer.indexOf('F') == -1) {
                        // Delete Data before proceeding
                        this["delete"](name);
                        setTimeout(function () {
                            // Updated Directory Block w/ Pointer
                            var block = _krnDiskDriver.buildBlock(_krnDiskDriver.convertHex(directoryBlock_1.data, 'hex').match(/.{2}/g), '1', availableKeys_1[0]);
                            sessionStorage.setItem(directoryBlock_1.key, block);
                        }, 10);
                    }
                    else {
                        // Updated Directory Block w/ Pointer
                        var block = this.buildBlock(this.convertHex(directoryBlock_1.data, 'hex').match(/.{2}/g), '1', availableKeys_1[0]);
                        sessionStorage.setItem(directoryBlock_1.key, block);
                    }
                    // Populate Files
                    for (var i = 0; i < availableKeys_1.length; i++) {
                        // Get Data Segment + Updated Data Reference to Substring 
                        var dataSegment = this.getDataSegment(data);
                        data = dataSegment.data;
                        // Check for pointer is needed
                        var block = void 0;
                        if (availableKeys_1[i + 1]) {
                            block = this.buildBlock(dataSegment.segment, '1', availableKeys_1[i + 1]);
                        }
                        else {
                            block = this.buildBlock(dataSegment.segment, '1');
                        }
                        // Update Item in Session Storage
                        sessionStorage.setItem(availableKeys_1[i], block);
                    }
                    return { 'success': true, 'msg': "File write to " + name + " done." };
                }
                else {
                    return { 'success': false, 'msg': "Cannot write data to " + name + ". No available space." };
                }
            }
            else {
                return { 'success': false, 'msg': "File System exception: " + name + " does not exist." };
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
                if (block.pointer.indexOf('F') !== -1) {
                    return { 'success': false, 'msg': "No data to read. File is empty." };
                }
                else {
                    var collecting = true;
                    var data = "";
                    while (collecting) {
                        // Check for next Pointer to Data
                        if (block.pointer.indexOf('F') == -1) {
                            // Convert Pointer + Create Block
                            var pointerKey = this.convertKey(block.pointer);
                            block = this.convertBlock(pointerKey);
                            // Decode Data to Char Codes + Concat for output
                            data = data + block.data;
                        }
                        else {
                            collecting = false;
                        }
                    }
                    // Return File Data
                    return { 'success': true, 'msg': data };
                }
            }
            else {
                return { 'success': false, 'msg': "File System exception: " + name + " does not exist." };
            }
        };
        /**
         * delete(name)
         * - Deletes a file with a
         *   given name in our File System.
         */
        DeviceDriverDisk.prototype["delete"] = function (name) {
            // Validate that file exists
            if (this.find(name, this.directory)) {
                // Get Block Object
                var block = this.find(name, this.directory, true);
                var emptyBlock = void 0;
                // Validate Directory Pointer
                if (block.pointer.indexOf('F') != -1) { // Null Pointer
                    // Update Directory Block w/ Empty Byte in Session Storage 
                    emptyBlock = this.buildBlock(this.convertHex(block.data, 'hex').match(/.{2}/g), '0');
                    sessionStorage.setItem(block.key, emptyBlock);
                }
                else {
                    var searching = true;
                    while (searching) {
                        // Check for next Pointer
                        if (block.pointer.indexOf('F') == -1) {
                            // Record Next Block
                            var next = this.convertBlock(this.convertKey(block.pointer));
                            // Create New Empty Header + Update Session Storage for Current
                            emptyBlock = this.buildBlock(this.convertHex(block.data, 'hex').match(/.{2}/g), '0', next.key);
                            sessionStorage.setItem(block.key, emptyBlock);
                            var test = this.convertBlock(block.key);
                            // Update Block Reference to next 
                            block = next;
                        }
                        else {
                            // Create New Empty Header + Update Session Storage for Current
                            emptyBlock = this.buildBlock(this.convertHex(block.data, 'hex').match(/.{2}/g), '0');
                            sessionStorage.setItem(block.key, emptyBlock);
                            var test = this.convertBlock(block.key);
                            searching = false;
                        }
                    }
                }
                return { 'success': true, 'msg': "File " + name + " successfully deleted." };
            }
            else {
                return { 'seccess': true, 'msg': "File System exception: " + name + " does not exist." };
            }
        };
        /**
         * list(flag)
         * - Lists all files currently
         *   being held on our disk.
         */
        DeviceDriverDisk.prototype.list = function (flag) {
            var output = [];
            var block;
            var start = this.directory.start;
            var end = this.directory.end;
            // Collect File Info for all Files within our Directory
            for (var t = start.t; t <= end.t; t++) {
                for (var s = start.s; s <= end.s; s++) {
                    for (var b = start.b; b <= end.b; b++) {
                        block = this.convertBlock({ t: t, s: s, b: b });
                        // Only Check Filled Blocks
                        if (block.filled) {
                            if (flag) { // Output All Files
                                output.push(this.listHelper(block));
                            }
                            else {
                                // Check for hidden file indicator
                                if (block.data.indexOf('.') != 0) {
                                    output.push(this.listHelper(block));
                                }
                            }
                        }
                    }
                }
            }
            // Output File Information
            _StdOut.putText("Directory: ");
            _StdOut.advanceLine();
            for (var i = 0; i < output.length; i++) {
                // Format Date + Time
                var date = output[i][1].substring(0, 2) + "-" + output[i][1].substring(4, 6) + "-" + output[i][1].substring(6, 8);
                var time = output[i][2].substring(0, 2) + ":" + output[i][2].substring(2, 4) + ":" + output[i][2].substring(4, 6);
                // Output to Console
                _StdOut.putText("   " + output[i][0] + " Created:  " + date + "  " + time);
                _StdOut.advanceLine();
            }
        };
        /**
         * listHelper(block)
         * - Breaks down data from our
         *   Block to collect info for
         *   that respective block.
         */
        DeviceDriverDisk.prototype.listHelper = function (block) {
            var step = 0;
            var info = ['', '', ''];
            for (var i = 0; i < block.data.length; i++) {
                switch (step) {
                    case 0: // File Name
                        if (i > 0 && block.data[i] == '.') {
                            step = 1;
                        }
                        else {
                            info[step] += block.data[i];
                        }
                        break;
                    case 1: // Date 
                        if (info[step].length < 8) {
                            info[step] += block.data[i];
                        }
                        else {
                            step = 2;
                        }
                        break;
                    case 2:
                        if (info[step].length < 6) {
                            info[step] += block.data[i];
                        }
                        break;
                    default:
                        return "File System exception: invalid directory entry.";
                }
            }
            return info;
        };
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
                            if (block.data.substr(0, name.length) == name) {
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
         * buildBlock(data, type, pointer?)
         * - Used to construct our data block
         *   for both directory and file entries.
         */
        DeviceDriverDisk.prototype.buildBlock = function (data, filled, pointer) {
            var block;
            var header;
            // Create Reserved Header
            if (pointer) {
                // Convert to Object
                pointer = this.convertKey(pointer);
                header = [filled, pointer.t, pointer.s, pointer.b];
            }
            else {
                header = [filled, 'F', 'F', 'F']; // Null Pointer
            }
            // Pad Data Block if needed
            var l = data.length;
            for (var i = l; i < _Disk.getDataSize(); i++) {
                data.push('00');
            }
            // Combine Header + Data
            block = header.concat(data);
            // Convert to String for I/O + Return
            return block.join('');
        };
        /**
         * getDataSegment(data)
         * - Creates a data segment to
         *   fill our current Data Block.
         */
        DeviceDriverDisk.prototype.getDataSegment = function (data) {
            // Populate Data Segment
            var segment = [];
            for (var i = 0; i < _Disk.getDataSize(); i++) {
                if (data[i]) {
                    var byte = TSOS.Utils.padHexValue(data[i]);
                    segment.push(byte); // Push Populated Byte
                }
            }
            // Update Original Data String - Removing Segment Taken
            var temp = [];
            for (var i = _Disk.getDataSize(); i < data.length; i++) {
                temp.push(data[i]);
            }
            // Update Reference
            data = temp;
            return { 'segment': segment, 'data': data };
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
                    for (var b = (t == 0 && s == 0) ? start.b : 0; b <= end.b; b++) {
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
            // Convert Data Block to Char Data
            block = this.convertHex(block, 'char');
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
         * convertHex(data, type)
         * - Converts a given string between
         *   Hex and Char.
         */
        DeviceDriverDisk.prototype.convertHex = function (data, type) {
            var newData = '';
            if (type == 'hex') {
                // Validate Data given isn't already in hex -- continue if already
                var regex = /^[A-Fa-f0-9]+$/;
                if (!regex.test(data)) {
                    // Convert Data into String
                    if (typeof (data) == 'object') {
                        data = data.join('');
                    }
                    for (var c in data) {
                        var hex = data[c].charCodeAt().toString(16);
                        newData += hex;
                    }
                }
            }
            else if (type == 'char') {
                // Add Header before Converting
                newData += data.substr(0, _Disk.getHeaderSize());
                // Iterate over entire string until end or filler is reached
                for (var i = _Disk.getHeaderSize(); (i < data.length && data.substr(i, 2) !== '00'); i += 2) {
                    newData += String.fromCharCode(parseInt(data.substr(i, 2), 16));
                }
            }
            return newData;
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
