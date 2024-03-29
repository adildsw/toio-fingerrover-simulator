"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdSpec = void 0;
var IdSpec = (function () {
    function IdSpec() {
    }
    IdSpec.prototype.parse = function (buffer) {
        if (buffer.byteLength < 1) {
            throw new Error('parse error');
        }
        var type = buffer.readUInt8(0);
        switch (type) {
            case 1:
                if (buffer.byteLength < 11) {
                    break;
                }
                return {
                    buffer: buffer,
                    data: {
                        x: buffer.readUInt16LE(1),
                        y: buffer.readUInt16LE(3),
                        angle: buffer.readUInt16LE(5),
                        sensorX: buffer.readUInt16LE(7),
                        sensorY: buffer.readUInt16LE(9),
                    },
                    dataType: 'id:position-id',
                };
            case 2:
                if (buffer.byteLength < 7) {
                    break;
                }
                return {
                    buffer: buffer,
                    data: {
                        standardId: buffer.readUInt32LE(1),
                        angle: buffer.readUInt16LE(5),
                    },
                    dataType: 'id:standard-id',
                };
            case 3:
                return { buffer: buffer, dataType: 'id:position-id-missed' };
            case 4:
                return { buffer: buffer, dataType: 'id:standard-id-missed' };
            default:
                break;
        }
        throw new Error('parse error');
    };
    return IdSpec;
}());
exports.IdSpec = IdSpec;
//# sourceMappingURL=id-spec.js.map