"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonSpec = void 0;
var ButtonSpec = (function () {
    function ButtonSpec() {
    }
    ButtonSpec.prototype.parse = function (buffer) {
        if (buffer.byteLength < 2) {
            throw new Error('parse error');
        }
        var id = buffer.readUInt8(0);
        if (id !== 1) {
            throw new Error('parse error');
        }
        var pressed = buffer.readUInt8(1) !== 0;
        return {
            buffer: buffer,
            data: {
                id: id,
                pressed: pressed,
            },
            dataType: 'button:press',
        };
    };
    return ButtonSpec;
}());
exports.ButtonSpec = ButtonSpec;
//# sourceMappingURL=button-spec.js.map