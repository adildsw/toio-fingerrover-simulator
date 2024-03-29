"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatterySpec = void 0;
var BatterySpec = (function () {
    function BatterySpec() {
    }
    BatterySpec.prototype.parse = function (buffer) {
        if (buffer.byteLength < 1) {
            throw new Error('parse error');
        }
        var level = buffer.readUInt8(0);
        return {
            buffer: buffer,
            data: {
                level: level,
            },
            dataType: 'battery:battery',
        };
    };
    return BatterySpec;
}());
exports.BatterySpec = BatterySpec;
//# sourceMappingURL=battery-spec.js.map