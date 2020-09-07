/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
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
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            console.log("KeyCode: " + keyCode);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // Letter
                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 187) && (keyCode <= 191)) { // Punctuation [ . / - + ]
                chr = String.fromCharCode(keyCode - 144);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 186)) { // Punctuation [ ; ]
                chr = String.fromCharCode(keyCode - 127);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 192) { // Punctuation: [ ` ]
                chr = String.fromCharCode(keyCode - 96);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 219) || (keyCode == 221)) { // Punctuation [ [ , ] ]
                chr = String.fromCharCode(keyCode - 128);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 220) {
                chr = String.fromCharCode(keyCode - 173); // Punctuation [ \ ]
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 222) {
                chr = String.fromCharCode(keyCode - 183); // Punctuation [ ' ]
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 48) && (keyCode <= 57)) { // Digits
                if (isShifted === true) {
                    if (keyCode == 48) {
                        chr = String.fromCharCode(keyCode - 7); // Punctuation [ ' ]
                        _KernelInputQueue.enqueue(chr);
                    }
                    else if ((keyCode == 49) || ((keyCode >= 51) && (keyCode <= 53))) {
                        chr = String.fromCharCode(keyCode - 16); // Punctuation [ ' ]
                        _KernelInputQueue.enqueue(chr);
                    }
                    else if (keyCode == 50) {
                        chr = String.fromCharCode(keyCode + 14);
                        _KernelInputQueue.enqueue(chr);
                    }
                    else if (keyCode == 54) {
                        chr = String.fromCharCode(keyCode + 40);
                        _KernelInputQueue.enqueue(chr);
                    }
                    else if ((keyCode == 55) || (keyCode == 57)) {
                        chr = String.fromCharCode(keyCode - 17);
                        _KernelInputQueue.enqueue(chr);
                    }
                    else if (keyCode == 56) {
                        chr = String.fromCharCode(keyCode - 14);
                        _KernelInputQueue.enqueue(chr);
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            }
            else if ((keyCode == 32) || (keyCode == 13)) { // Space + Enter
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
