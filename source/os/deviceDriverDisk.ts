/* ----------------------------------
   DeviceDriverDisk.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */

    module TSOS {
        export class DeviceDriverDisk extends DeviceDriver {
            constructor(public formatted = false, 
                        public hidden = ".", 
                        public masterBootrecord = '0:0:0',
                        public directory = {'start': {'t': 0, 's': 0, 'b': 1}, 'end': {'t': 0, 's': 7, 'b': 6}},
                        public file = {'start': {'t': 1, 's': 0, 'b': 0}, 'end': {'t': 3, 's': 7, 'b': 6}}) {
                // Override the base method pointers.

                // The code below cannot run because "this" can only be
                // accessed after calling super.
                // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
                // So instead...
                super();
                this.driverEntry = this.krnDskDriverEntry;
                this.isr = this.krnDskDispatcher;
            }

            public krnDskDriverEntry() {
                // Initialization routine for this, the kernel-mode Disk Device Driver.
                // Only Load Dsk Definition if User's browser supports it.
                if (this.krnDskBrowserSupport) {
                    this.status = "loaded";

                    // Clear Session Storage -- TESTING PURPOSES ONLY
                    sessionStorage.clear();
                }
            }

            /**
             * krnDskBrowserSupport() 
             * - Validates if the users' browser
             *   supports session storage.
             */
            public krnDskBrowserSupport() {
                try {
                    return window['sessionStorage'] != null; 
                } catch (e) {
                    return false;
                }
            }

            /**
             * krnDskDispatcher
             * - Primary Dispatcher for
             *   all File System operations.
             */
            public krnDskDispatcher(params) {
                let status;

                if (params.action == 'format') {
                    status = this.format(params.flag); 
                    _StdOut.putText(status);
                    
                } else {
                    if (this.formatted) {
                        switch(params.action) {
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
                    } else {
                        _StdOut.putText("File System exception. Must format Hard Drive first.");
                    }
                }
            }

            /**
             * format(flag?)
             * - Initializes our Disk 
             *   definition, type is a boolean
             *   flag used to determine half or full.
             */
            public format(flag) {
                // Verify Disk isn't already formatted
                if (!this.formatted) {
                    _Disk.init(flag);
                    this.formatted = true;

                    // Output Success
                    return "Hard drive fully formatted.";
                } else {
                    return "Hard drive has already been fully formatted";
                }
            }

            /**
             * create(name, flag?)
             * - Creates a file with a given
             *   name within our File System.
             *   Flag is used for Copy Functionality
             */
            public create(name, flag?) {
                // Validate Length of File Name
                if (name.length > _Disk.getDataSize() - 8) {    // Subtract 8 for Date String
                    return 'File name ' + name + ' is too big.';
                } else {
                    // Validate New File doesn't already exist within our directory
                    if (!this.find(name, this.directory)) {
                        // Get Available Directory Key
                        let availableKeys = this.getKeys(this.directory, 1);

                        if (availableKeys.length > 0) {
                            // Get Key + Create Data Holder
                            let key = availableKeys[0];
                            let data;

                            // Get Timestamp for Entry
                            let timestamp = new Date().toISOString().slice(0,10).replace(/-/g,"");

                            // Prep Data for Block Creation
                            data = this.convertHex(name + timestamp, 'hex');
                            data = data.match(/.{2}/g);

                            // Create Block for Directory Entry
                            let block = this.buildBlock(data);

                            // Set Item in Session Storage
                            sessionStorage.setItem(key, block);

                            return "File " + name + " created.";
                        } else {
                            return "File " + name + " could not be created. No available space.";
                        }
                    } else {
                        return "File " + name + " already exists.";
                    }
                }
            }

            /**
             * write(name, data)
             * - Writes to a file with a
             *   given name in our File System.
             */
            public write(name, data) {
                // Validate File Exists
                if (this.find(name, this.directory)) {
                    // Encode Data to Hex for input + Accurate Size
                    data = this.convertHex(data, 'hex');
                    data = data.match(/.{2}/g);

                    // Get Needed Block Size
                    let size = Math.floor(data.length / _Disk.getDataSize());

                    if (data.length % _Disk.getDataSize() != 0) {
                        size++; // Additonal Block for leftovers
                    }

                    // Find all needed keys within our File Range
                    let availableKeys = this.getKeys(this.file, size);

                    // Verify all needed keys found
                    if (availableKeys.length > 0) {
                        // Get Directory Block Reference
                        let directoryBlock = this.find(name, this.directory, true);

                        // Updated Directory Block w/ Pointer
                        let block = this.buildBlock(this.convertHex(directoryBlock.data, 'hex').match(/.{2}/g), availableKeys[0]);
                        sessionStorage.setItem(directoryBlock.key, block);

                        let count = 0;

                        // Populate Files
                        for (let i = 0; i < availableKeys.length; i++) {
                            console.log("ITERATION: " + count);
                            console.log("CURRENT DATA (BEFORE SEGMENT): " + data);

                            // Get Data Segment + Updated Data Reference to Substring 
                            let dataSegment = this.getDataSegment(data);
                            data = dataSegment.data;

                            console.log("SEGMENT DATA: " + dataSegment.segment);
                            console.log("CURRENT DATA (AFTER SEGMENT): " + data);
                            

                            // Check for pointer is needed
                            let block;
                            if (availableKeys[i+1]) {
                                block = this.buildBlock(dataSegment.segment, availableKeys[i+1]);  
                            } else {
                                block = this.buildBlock(dataSegment.segment);
                            }

                            count++;

                            // Update Item in Session Storage
                            sessionStorage.setItem(availableKeys[i], block);
                        }

                        return "File write to " + name + " done.";
                    } else {
                        return "Cannot write data to " + name + ". No available space.";
                    }
                } else {
                    return "File " + name + " does not exist.";
                }
            }

            /**
             * read(name)
             * - Reads a file with a given
             *   name from our File System.
             */
            public read(name) {
                // Validate File Exists
                if (this.find(name, this.directory)) {
                    // Get Block Object
                    let block = this.find(name, this.directory, true);

                    // Validate Directory Pointer to Data
                    if (block.pointer.indexOf('F') !== -1) {
                        return "No data to read. File is empty.";
                    } else {
                        let collecting = true;
                        let data = "";

                        while (collecting) {
                            // Check for next Pointer to Data
                            if (block.pointer.indexOf('F') == -1) {
                                // Convert Pointer + Create Block
                                let pointerKey = this.convertKey(block.pointer);
                                block = this.convertBlock(pointerKey);

                                // Decode Data to Char Codes + Concat for output
                                data = data + block.data;

                            } else {
                                collecting = false;
                            }
                        }

                        // Return File Data
                        return data; 
                    }
                } else {
                    return "File " + name + " does not exist ";
                }
            }

            /**
             * delete(name)
             * - Deletes a file with a
             *   given name in our File System.
             */
            public delete(name) {}

            /**
             * find(name, source, flag?)
             * - Used to test if a given name
             *   within a source exists. Can return
             *   boolean or the found object dependent on flag.
             */
            public find(name, source, flag?) {
                let block; 
                let found = false; 
                let start = source.start;
                let end = source.end;

                out:
                for (let t = start.t; t <= end.t; t++) {
                    for (let s = start.s; s <= end.s; s++) {
                        for (let b = start.b; b <= end.b; b++) {
                            block = this.convertBlock({t, s, b});

                            // Only Check Filled Blocks
                            if (block.filled) {
                                if (block.data.substr(0, name.length) == name) {
                                    found = true;
                                    break out;  // Break out to prevent block overwrite
                                }
                            }
                        }
                    }
                }

                // Flag used to determine if boolean or object return type
                if (flag) {
                    return block;
                } else {
                    return found;
                }
            }

            /**
             * buildBlock(data, type, pointer?)
             * - Used to construct our data block 
             *   for both directory and file entries. 
             */
            public buildBlock(data, pointer?) {
                let block;
                let header;

                // Create Reserved Header
                if (pointer) {
                    // Convert to Object
                    pointer = this.convertKey(pointer);
                    header = ['1', pointer.t, pointer.s, pointer.b];

                } else {
                    header = ['1', 'F', 'F', 'F'];   // Null Pointer
                }

                // Pad Data Block if needed
                let l = data.length;
                for (let i = l; i < _Disk.getDataSize(); i++) {
                    data.push('00');
                }

                // Combine Header + Data
                block = header.concat(data);

                // Convert to String for I/O + Return
                return block.join('');
            }

            /**
             * getDataSegment(data)
             * - Creates a data segment to 
             *   fill our current Data Block.
             */
            public getDataSegment(data) {
                // Populate Data Segment
                let segment = [];

                for (let i = 0; i < _Disk.getDataSize(); i++) {
                    if (data[i]) {
                        let byte = TSOS.Utils.padHexValue(data[i]);
                        segment.push(byte);  // Push Populated Byte
                    }
                }

                // Update Original Data String - Removing Segment Taken
                let temp = [];
                for (let i = _Disk.getDataSize(); i < data.length; i++) {
                    temp.push(data[i]);
                }

                // Update Reference
                data = temp;

                return {'segment': segment, 'data': data};
            }

            /**
             * getKeys(source, size)
             * - Returns a list of String Keys
             *   for segments of our disk that
             *   are not filled.
             */
            public getKeys(source, size) {
                // Break Down Params
                let start = source.start;
                let end = source.end;
                let count = 0;

                let availableKeys = [];

                out:
                for (var t = start.t; t <= end.t; t++) {
                    for (var s = start.s; s <= end.s; s++) {
                        for (var b = start.b; b <= end.b; b++) {
                            let block = this.convertBlock({'t': t, 's': s, 'b': b});

                            // Check if filled
                            if (!block.filled) {
                                // Add valid key to list
                                availableKeys.push(this.convertKey({'t': t, 's': s, 'b': b}));
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
                } else {
                    return [];  // No Available Space
                }
                
            }

            /**
             * convertKey(key)
             * - Converts key to both 
             *   object or string based
             *   on key param given
             */
            public convertKey(key) {
                if (typeof(key) == 'object') {                                 // Session Storage 
                    return key.t + ':' + key.s + ':' + key.b;
                } else if (typeof(key) == 'string') {                          // Indexing
                    // Validate Key Type [ID or Pointer]
                    if (key.indexOf(':') !== -1) {
                        key = key.split(':');
                        return { 't': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2])};
                    } else {
                        key = key.split('');
                        return { 't': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2])};
                    }
                }
            }

            /**
             * ConvertBlock(key)
             * - Creates a Block Object based
             *   on a key used within SessionStorage
             */
            public convertBlock(key) {
                if (typeof(key) == 'object') {
                    key = this.convertKey(key);
                }

                // Get Item in Session Storage
                let block = sessionStorage.getItem(key);

                // Convert Data Block to Char Data
                block = this.convertHex(block, 'char');
                
                var filled = false;

                if (block[0] == "1") {
                    filled = true;
                }

                // Create Block Object
                let object = {'key': key,
                            'filled': filled,
                            'pointer': block.substring(1, 4),
                            'data': block.substring(_Disk.getHeaderSize())}

                return object;
            }

            /**
             * convertHex(data, type)
             * - Converts a given string between
             *   Hex and Char.
             */
            public convertHex(data, type) {
                let newData = '';

                if (type == 'hex') {
                    // Validate Data given isn't already in hex -- continue if already
                    let regex = /^[A-Fa-f0-9]+$/;

                    if (!regex.test(data)) {
                        // Convert Data into String
                        if (typeof(data) == 'object') {
                            data = data.join('');
                        }

                        for (let c in data) {
                            let hex = data[c].charCodeAt().toString(16);
                            newData += hex;
                        }
                    }
                } else if (type == 'char') {
                    // Add Header before Converting
                    newData += data.substr(0, _Disk.getHeaderSize());

                    // Iterate over entire string until end or filler is reached
                    for (let i = _Disk.getHeaderSize(); (i < data.length && data.substr(i, 2) !== '00'); i += 2) {
                        newData += String.fromCharCode(parseInt(data.substr(i, 2), 16));
                    }
                }

                return newData;
            }

            /**
             * clearBlock(key)
             * - reinitializes a block
             *   within our disk
             */
            public clearBlock(key) {
                _Disk.loadBlock(key);
            }
        }
    }