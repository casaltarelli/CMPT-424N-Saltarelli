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
            if (directory === void 0) { directory = { 'type': 'directory', 'start': '0:0:1', 'end': '0:7:6:' }; }
            if (file === void 0) { file = { 'type': 'file', 'start:': '1:0:0', 'end': '3:7:6' }; }
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
            }
        };
        /**
         * krnDskBrowserSupport()
         * - Validates if the users browser
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
        DeviceDriverDisk.prototype.krnDskDispatcher = function (action, data) {
            // TODO: Implement Ability to breakdown Dispatcher Parameters
            var flag = false;
            // Update Flag if any was given
            if (data) {
                if (data[0] == '-') { // Check for Flag Option
                    flag = true;
                }
            }
            var status;
            if (action == "format") {
                if (flag) {
                    status = this.format(flag);
                    _StdOut.putText(status.msg);
                }
                else {
                    status = this.format();
                    _StdOut.putText(status.msg);
                }
            }
            else {
                // TODO: Implement File System Actions Here
                switch (action) {
                    case 'create':
                        status = this.create(data);
                        break;
                    case 'write':
                        //this.write(name, data)
                        break;
                    default:
                        _Kernel.krnTrapError("File System exception: Invalid action " + action);
                }
            }
        };
        /**
         * format(flag?)
         * - Initializes our Disk
         *   definition, type is a boolean
         *   flag used to determine half or full
         */
        DeviceDriverDisk.prototype.format = function (flag) {
            if (!this.formatted) {
                if (flag) {
                    // TODO: Implement Quick Format Functionality
                }
                else {
                    // Init Disk
                    _Disk.init();
                    this.formatted = true;
                }
                // Output Success
                return { status: 0, msg: "Hard drive fully formatted." };
            }
            else {
                return { status: 1, msg: "Hard drive has already been fully formatted" };
            }
        };
        /**
         * create(name)
         * - Creates a file with a given
         *   name within our File System
         */
        DeviceDriverDisk.prototype.create = function (name) {
            // Validate Length of File Name
            if (name.length > _Disk.getDataSize()) {
                _StdOut.putText('File name ' + name + ' is too big.');
            }
            else {
                // Validate New File doesn't already exist
                if (!this.find(name, this.directory)) {
                    // Get Available Directory Keys
                    var availableKeys = this.getKeys(this.directory, 1);
                    if (availableKeys) {
                        // Create Header + File Name
                        var header = this.buildHeader().toString;
                        sessionStorage.setItem(availableKeys[0], header + name);
                        return { status: 0, msg: "File " + name + " created." };
                    }
                    else {
                        return { status: 1, msg: "File " + name + " could not be created." };
                    }
                }
                else {
                    return { status: 1, msg: "File " + name + " already exists." };
                }
            }
        };
        /**
         * read(name)
         * - Reads a file with a given
         *   name from our File System
         */
        DeviceDriverDisk.prototype.read = function (name) {
            // Validate File Exists
            if (this.find(name, this.directory)) {
                // Get Block Object
                var block = this.find(name, this.directory, true);
                var collecting = true;
                var data = block.data;
                while (collecting) {
                    // Validate Pointer to Data
                    if (block.pointer.indexOf('-') == -1) {
                        block = this.convertBlock(block.pointer);
                        // Concat String Data
                        data = data + block.data;
                    }
                    else {
                        collecting = false;
                    }
                }
            }
            else {
                return { status: 1, msg: "File " + name + " does not exist " };
            }
        };
        /**
         * write(name, data)
         * - Writes to a file with a
         *   given name in our File System
         */
        DeviceDriverDisk.prototype.write = function (name, data) {
            // Validate File Exists
            if (this.find(name, this.directory)) {
                // Get Needed Block Size
                var size = data / _Disk.getDataSize();
                // Find all needed keys
                var availableKeys = this.getKeys(size, this.file);
                var blockData = void 0;
                for (var _i = 0, availableKeys_1 = availableKeys; _i < availableKeys_1.length; _i++) {
                    var k = availableKeys_1[_i];
                    for (var i = 0; i < _Disk.getDataSize(); i++) {
                        blockData = blockData;
                    }
                }
            }
        };
        /**
         * delete(name)
         * - Deltes a file with a
         *   given name in our File System
         */
        DeviceDriverDisk.prototype["delete"] = function (name) { };
        /**
         * onvertBlock(key)
         * - Creates a Block Object based
         *   on a key used within SessionStorage
         */
        DeviceDriverDisk.prototype.convertBlock = function (key) {
            if (typeof key == 'object') {
                key = this.convertKey(key);
            }
            // Create Block Object
            var block = sessionStorage.getItem(key);
            var filled = false;
            if (parseInt[0] == "1") {
                filled = true;
            }
            var blockO = { 'filled': filled,
                'pointer:': this.convertKey(block.substring(1, 4)),
                'data': block.substring(_Disk.getHeaderSize()) };
            return blockO;
        };
        /**
         * buildBlock(key, data)
         * - Constructs a Data Block to be
         *   concatendated with out data header
         */
        DeviceDriverDisk.prototype.buildBlock = function (data) {
            // Convert String into Array
            data = data.split('');
            // Populate Block
            var dataBlock;
            for (var i = 0; i < _Disk.getDataSize(); i++) {
                dataBlock.push(data[i]);
            }
        };
        /**
         * buildHeader(key)
         * - Used to construct our header array
         *   to concatenated with our data block.
         */
        DeviceDriverDisk.prototype.buildHeader = function (key) {
            if (key) {
                return ['1', key.t, key.s, key.b];
            }
            else {
                return ['1', '-', '-', '-'];
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
         * getKeys(source, size)
         * - Returns a list of String Keys
         *   for segments of our disk that
         *   are not filled.
         */
        DeviceDriverDisk.prototype.getKeys = function (size, source) {
            // Break Down Params
            var start = source.start;
            var end = source.end;
            var count = 0;
            var availableKeys = [];
            out: for (var t = start.t; t < end.t; t++) {
                for (var s = start.s; s < end.s; s++) {
                    for (var b = start.b; b < end.b; b++) {
                        var block = this.convertBlock({ t: t, s: s, b: b });
                        // Check if filled
                        if (!block.filled) {
                            // Add block to list
                            availableKeys.push(this.convertKey({ t: t, s: s, b: b }));
                            count++;
                        }
                        // Check if needed keys have been found
                        if (count == size) {
                            break out;
                        }
                    }
                }
            }
            return availableKeys;
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
            out: for (var t = start.t; t < end.t; t++) {
                for (var s = start.s; s < end.s; s++) {
                    for (var b = start.b; b < end.b; b++) {
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
