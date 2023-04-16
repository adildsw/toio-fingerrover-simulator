"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorSpec = void 0;
var SensorSpec = (function () {
    function SensorSpec() {
    }
    SensorSpec.prototype.parse = function (buffer) {
        var type = buffer.readUInt8(0);
        switch (type) {
            case 0x01: {
                if (buffer.byteLength < 3) {
                    throw new Error('parse error');
                }
                var isSloped = buffer.readUInt8(1) === 0;
                var isCollisionDetected = buffer.readUInt8(2) === 1;
                var isDoubleTapped = buffer.readUInt8(3) === 1;
                var orientation_1 = buffer.readUInt8(4);
                var shakeLevel = buffer.byteLength > 5 ? buffer.readUInt8(5) : 0;
                return {
                    buffer: buffer,
                    data: {
                        isSloped: isSloped,
                        isCollisionDetected: isCollisionDetected,
                        isDoubleTapped: isDoubleTapped,
                        orientation: orientation_1,
                        shakeLevel: shakeLevel,
                    },
                    dataType: 'sensor:motion',
                };
            }
            case 0x02: {
                var id = buffer.readUInt8(1);
                var force = void 0, directionX = void 0, directionY = void 0, directionZ = void 0;
                if (buffer.length > 2) {
                    force = buffer.readUInt8(2);
                    directionX = buffer.readInt8(3) / 10;
                    directionY = buffer.readInt8(4) / 10;
                    directionZ = buffer.readInt8(5) / 10;
                }
                else {
                    force = 0;
                    directionX = 0;
                    directionY = 0;
                    directionZ = 0;
                }
                return {
                    buffer: buffer,
                    data: {
                        id: id,
                        force: force,
                        directionX: directionX,
                        directionY: directionY,
                        directionZ: directionZ,
                    },
                    dataType: 'sensor:magnet',
                };
            }
            case 0x03: {
                var format = buffer.readUInt8(1);
                if (format === 1) {
                    var roll = buffer.readInt16LE(2);
                    var pitch = buffer.readInt16LE(4);
                    var yaw = buffer.readInt16LE(6);
                    return {
                        buffer: buffer,
                        data: { roll: roll, pitch: pitch, yaw: yaw },
                        dataType: 'sensor:attitude-euler',
                    };
                }
                else if (format === 2) {
                    var w = buffer.readInt16LE(2) / 10000;
                    var x = buffer.readInt16LE(4) / 10000;
                    var y = buffer.readInt16LE(6) / 10000;
                    var z = buffer.readInt16LE(8) / 10000;
                    return {
                        buffer: buffer,
                        data: { w: w, x: x, y: y, z: z },
                        dataType: 'sensor:attitude-quaternion',
                    };
                }
            }
        }
        throw new Error('parse error');
    };
    return SensorSpec;
}());
exports.SensorSpec = SensorSpec;
//# sourceMappingURL=sensor-spec.js.map