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

                    // Clear Session Storage -- TESTING
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
                    _StdOut.putText(status.msg);
                    
                } else {
                    if (this.formatted) {
                        switch(params.action) {
                            case 'create':
                                status = this.create(params.name, params.flag);
                                _StdOut.putText(status.msg);
                                break;
    
                            case 'write':
                                status = this.write(params.name, params.data);
                                _StdOut.putText(status.msg);
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
                    return { status: 0, msg: "Hard drive fully formatted."};
                } else {
                    return { status: 1, msg: "Hard drive has already been fully formatted"};
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
                if (name.length > _Disk.getDataSize()) {
                    _StdOut.putText('File name ' + name + ' is too big.');
                } else {
                    // Validate New File doesn't already exist within our directory
                    if (!this.find(name, this.directory)) {
                        // Get Available Directory Keys
                        let availableKeys = this.getKeys(this.directory, 1);

                        if (availableKeys.length > 0) {
                            // Get Current Key
                            let key = availableKeys[0];

                            // Create Header + File Name Block
                            let block = this.buildBlock(name);

                            // Set Item in Session Storage
                            sessionStorage.setItem(key, block.join(''));

                            return { status: 0, msg: "File " + name + " created."};
                        } else {
                            return { status: 1, msg: "File " + name + " could not be created. No available space."};
                        }
                    } else {
                        return { status: 1, msg: "File " + name + " already exists."};
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
                    // Get Needed Block Size
                    let size = Math.floor(data.length / _Disk.getDataSize());

                    if (data.length % _Disk.getDataSize() != 0) {
                        size++; // Additonal Block for leftovers
                    }

                    // Find all needed keys
                    console.log("Call From Write");
                    let availableKeys = this.getKeys(this.file, size);

                    // Verify needed all keys found
                    if (availableKeys.length > 0) {
                        // Get Directory Block Reference
                        let directoryBlock = this.find(name, this.directory, true);

                        // Updated Directory Block w/ Pointer
                        let block = this.buildBlock(name, availableKeys[0]);
                        console.log("New Header: " + block.toString());
                        sessionStorage.setItem(directoryBlock.key, block.join(''));

                        // Populate Files
                        for (let i = 0; i < availableKeys.length; i++) {
                            // Get Data Segment + Updated Data Reference;
                            let dataSegment = this.getDataBlock(data);
                            data = dataSegment.data;

                            // Check for pointer
                            let block;
                            if (availableKeys[i+1]) {
                                block = this.buildBlock(dataSegment.segment, availableKeys[i+1]);  
                            } else {
                                block = this.buildBlock(dataSegment.segment);
                            }

                            // Update Item in Session Storage
                            sessionStorage.setItem(availableKeys[i], block);
                        }

                        return { msg: "File write to " + name + " done."};
                    } else {
                        return { msg: "Cannot write data to " + name + ". No available space."};
                    }
                } else {
                    return {msg: "File " + name + " does not exist."};
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
                    var block = this.find(name, this.directory, true);

                    var collecting = true;
                    var data = block.data;

                    while (collecting) {
                        // Validate Pointer to Data
                        if (block.pointer.indexOf('-') == -1) {
                            block = this.convertBlock(block.pointer);

                            // Concat String Data
                            data = data + block.data;
                        } else {
                            collecting = false;
                        }
                    }
                } else {
                    return {status: 1, msg: "File " + name + " does not exist "};
                }
            }

            /**
             * delete(name)
             * - Deltes a file with a
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
                                if (block.data == name) {
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
             * buildBlock(data, pointer?)
             * - Used to construct our header array
             *   to concatenated with our data block.
             */
            public buildBlock(data, pointer?) {
                let block;

                // Create Reserved Header
                if (pointer) {
                    // Convert to Object
                    pointer = this.convertKey(pointer);
                    
                    block = ['1', pointer.t, pointer.s, pointer.b];
                } else {
                    block = ['1', '-', '-', '-'];
                }

                // Add Data
                block.push(data);
                
                return block;
            }

            /**
             * getDataBlock(data)
             * - Creates a string segment from 
             *   the given data string. Returns 
             *   object containing segment + updated
             *   data.
             */
            public getDataBlock(data) {
                // Check if Data Type
                if (typeof(data) == 'string') {
                    // Convert to Array of two char strings
                    data = data.match(/.{2}/g);
                }

                // Populate Data Segment
                let segment = [];

                for (let i = 0; i < _Disk.getDataSize(); i++) {
                    // Check for leftover padding
                    if (i > data.length) {
                        segment.push('--');
                    } else {
                        segment.push(data[i]);
                    }
                }

                // Convert Data back to String
                data = data.join('');

                return {'segment': segment.join(''), 'data': data.substring(_Disk.getDataSize())};
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

                                console.log("Valid Key Found!");
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

                // Create Block Object
                let block = sessionStorage.getItem(key);
                var filled = false;

                if (block[0] == "1") {
                    filled = true;
                }

                let object = {'key': key,
                            'filled': filled,
                            'pointer:': block.substring(1, 4),
                            'data': block.substring(_Disk.getHeaderSize())}

                return object;
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