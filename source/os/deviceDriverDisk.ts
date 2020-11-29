/* ----------------------------------
   DeviceDriverDisk.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */

    module TSOS {
        export class DeviceDriverDisk extends DeviceDriver {
            constructor(public formatted = false, 
                        public hidden = ".", 
                        public masterBootrecord = '0:0:0',
                        public directory = { 'type': 'directory', 'start': '0:0:1', 'end': '0:7:6:'},
                        public file = {'type': 'file', 'start:': '1:0:0', 'end': '3:7:6'}) {
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
                    if (params.flag) {
                        status = this.format(params.flag); 
                        _StdOut.putText(status.msg);
                    } else {
                        status = this.format();
                        _StdOut.putText(status.msg);
                    }
                } else {
                    // TODO: Implement File System Actions Here
                    switch(params.action) {
                        case 'create':
                            if (params.flag) {
                                status = this.create(params.data, params.flag);
                            }
                            status = this.create(params.data);
                            break;

                        case 'write':
                            //this.write(name, data)
                            break;

                        default:
                            _Kernel.krnTrapError("File System exception: Invalid action " + params.action);
                    }
                }
            }

            /**
             * format(flag?)
             * - Initializes our Disk 
             *   definition, type is a boolean
             *   flag used to determine half or full.
             */
            public format(flag?) {
                // Verify Disk isn't already formatted
                if (!this.formatted) {
                    if (flag) {
                        _Disk.init(flag);
                    } else {
                        _Disk.init();
                    }

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
                    // Validate New File doesn't already exist
                    if (!this.find(name, this.directory)) {
                        // Get Available Directory Keys
                        let availableKeys = this.getKeys(this.directory, 1);

                        if (availableKeys) {
                            // Create Header + File Name
                            let header = this.buildHeader().toString;
                            sessionStorage.setItem(availableKeys[0], header + name);

                            return { status: 0, msg: "File " + name + " created."};
                        } else {
                            return { status: 1, msg: "File " + name + " could not be created."};
                        }
                    } else {
                        return { status: 1, msg: "File " + name + " already exists."};
                    }
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
             * write(name, data)
             * - Writes to a file with a
             *   given name in our File System.
             */
            public write(name, data) {
                // Validate File Exists
                if (this.find(name, this.directory)) {
                    // Get Needed Block Size
                    let size = data / _Disk.getDataSize();

                    // Find all needed keys
                    let availableKeys = this.getKeys(size, this.file);
                    let blockData;
                    for (let k of availableKeys) {
                        for (let i = 0; i < _Disk.getDataSize(); i++) {
                            blockData = blockData    
                        }
                    }
                }
            }

            /**
             * delete(name)
             * - Deltes a file with a
             *   given name in our File System.
             */
            public delete(name) {}

            /**
             * onvertBlock(key)
             * - Creates a Block Object based
             *   on a key used within SessionStorage
             */
            public convertBlock(key) {
                if (typeof key == 'object') {
                    key = this.convertKey(key);
                }

                // Create Block Object
                let block = sessionStorage.getItem(key);
                var filled = false;

                if (parseInt[0] == "1") {
                    filled = true;
                }

                let blockO = {'filled': filled,
                            'pointer:': this.convertKey(block.substring(1, 4)),
                            'data': block.substring(_Disk.getHeaderSize())}

                return blockO;
            }

            /**
             * buildBlock(key, data)
             * - Constructs a Data Block to be
             *   concatendated with out data header.
             */
            public buildBlock(data) {
                // Convert String into Array
                data = data.split('');

                // Populate Block
                let dataBlock;

                for (let i = 0; i < _Disk.getDataSize(); i++) {
                    dataBlock.push(data[i]);
                }
            }

            /**
             * buildHeader(key)
             * - Used to construct our header array
             *   to concatenated with our data block.
             */
            public buildHeader(key?) {
                if (key) {
                    return ['1', key.t, key.s, key.b];
                } else {
                    return ['1', '-', '-', '-'];
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
             * getKeys(source, size)
             * - Returns a list of String Keys
             *   for segments of our disk that
             *   are not filled.
             */
            public getKeys(size, source) {
                // Break Down Params
                let start = source.start;
                let end = source.end;
                var count = 0;

                let availableKeys = [];

                out:
                for (let t = start.t; t < end.t; t++) {
                    for (let s = start.s; s < end.s; s++) {
                        for (let b = start.b; b < end.b; b++) {
                            let block = this.convertBlock({t, s, b});

                            // Check if filled
                            if (!block.filled) {
                                // Add block to list
                                availableKeys.push(this.convertKey({t, s, b}));
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
            }

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
                for (let t = start.t; t < end.t; t++) {
                    for (let s = start.s; s < end.s; s++) {
                        for (let b = start.b; b < end.b; b++) {
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
             * clearBlock(key)
             * - reinitializes a block
             *   within our disk
             */
            public clearBlock(key) {
                _Disk.loadBlock(key);
            }
        }
    }